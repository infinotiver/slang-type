import { consumeDailyRequests } from "./_lib/aiQuota.js";
import { parse } from "cookie";
import { verifyToken } from "./_lib/auth.js";
const MODEL = "gemini-2.5-flash-lite";
const MAX_WORDS = 800;
const MIN_WORDS = 5;
const MAX_THEME_LENGTH = 100;

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const UPSTREAM_TIMEOUT_MS = 12_000;

function sanitizeTheme(theme) {
    return String(theme || "")
        .trim()
        .slice(0, MAX_THEME_LENGTH)
        .replace(/[<>"'`;]/g, "");
}

function getClientKey(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0].trim();
    }
    return req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(clientKey) {
    const now = Date.now();

    // Periodic cleanup to prevent unbounded memory growth
    if (rateLimitStore.size > 10_000) {
        for (const [key, timestamps] of rateLimitStore.entries()) {
            const alive = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
            if (alive.length === 0) {
                rateLimitStore.delete(key);
            } else {
                rateLimitStore.set(key, alive);
            }
        }
    }

    const existing = rateLimitStore.get(clientKey) || [];
    const recent = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    recent.push(now);
    rateLimitStore.set(clientKey, recent);
    return true;
}

function json(res, status, payload) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(JSON.stringify(payload));
}

function normalizeWordList(words, limit) {
    return [...new Set(words
        .slice(0, limit)
        .filter((word) => typeof word === "string" && /^[a-z]{2,20}$/i.test(word))
        .map((word) => word.toLowerCase()))];
}

function fallbackParseWordsFromText(text, limit) {
    // Accept comma/newline/space separated output as fallback when model doesn't return JSON.
    const candidates = String(text || "")
        .replace(/[\[\]{}"']/g, " ")
        .split(/[\s,\n\r;:|]+/)
        .filter(Boolean);

    return normalizeWordList(candidates, limit);
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return json(res, 405, { error: "method_not_allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return json(res, 401, { error: "server_not_configured" });
    }

    const clientKey = getClientKey(req);
    if (!checkRateLimit(clientKey)) {
        return json(res, 429, { error: "rate_limited" });
    }

    const contentType = req.headers["content-type"] || "";
    if (typeof contentType !== "string" || !contentType.includes("application/json")) {
        return json(res, 415, { error: "unsupported_media_type" });
    }

    const rawBody =
        typeof req.body === "string"
            ? (() => {
                try {
                    return JSON.parse(req.body);
                } catch {
                    return {};
                }
            })()
            : req.body || {};

    if (!rawBody || typeof rawBody !== "object") {
        return json(res, 400, { error: "invalid_payload" });
    }

    const { theme, wordCount } = rawBody;
    const sanitizedTheme = sanitizeTheme(theme);
    const requestedCount = Number(wordCount);

    if (!sanitizedTheme) {
        return json(res, 400, { error: "invalid_theme" });
    }

    if (
        !Number.isInteger(requestedCount) ||
        requestedCount < MIN_WORDS ||
        requestedCount > MAX_WORDS
    ) {
        return json(res, 400, { error: "invalid_word_count" });
    }

    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;
    if (!token) {
        return json(res, 401, { error: "unauthorized" });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
        return json(res, 401, { error: "unauthorized" });
    }

    const quota = await consumeDailyRequests(payload.userId);
    if (!quota.ok) {
        return json(res, 429, {
            error: "request_quota_exceeded",
            remaining: 0,
            limit: quota.limit,
        });
    }
    const systemPrompt = `You are a word generator for a typing test application. Generate exactly ${requestedCount} unique, common English words related to the theme: "${sanitizedTheme}".

Requirements:
- Return ONLY a JSON object with a "words" array
- Each word must be 2-20 characters long
- Words must be lowercase and contain only letters
- No duplicates
- No proper nouns or brand names
- No special characters or numbers
- Focus on common, everyday words

Response format:
{"words": ["word1", "word2", ...]}`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }],
                    },
                    contents: [{
                        parts: [{
                            text: `Generate ${requestedCount} words about: ${sanitizedTheme}`,
                        }],
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                        responseMimeType: "application/json",
                    },
                }),
            },
        );
        clearTimeout(timeout);

        if (!geminiRes.ok) {
            if (geminiRes.status === 429) {
                return json(res, 429, { error: "provider_rate_limited" });
            }
            return json(res, 502, { error: "provider_error" });
        }

        const data = await geminiRes.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content || typeof content !== "string") {
            return json(res, 502, { error: "invalid_provider_response" });
        }

        let words = [];
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed.words)) {
                    words = normalizeWordList(parsed.words, requestedCount);
                }
            }
        } catch {
            // fall through to fallback parser
        }

        // Fallback if provider didn't return strict JSON
        if (words.length === 0) {
            words = fallbackParseWordsFromText(content, requestedCount);
        }

        if (words.length === 0) {
            return json(res, 502, { error: "no_valid_words" });
        }

        return json(res, 200, {
            words,
            theme: sanitizedTheme,
            timestamp: Date.now(),
            quota: {
                remaining: quota.remaining,
                limit: quota.limit,
            },
        });
    } catch {
        return json(res, 500, { error: "internal_error" });
    }
}

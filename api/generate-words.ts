import type { VercelRequest, VercelResponse } from "@vercel/node";
const MODEL = "llama-3.1-8b-instant";
const MAX_WORDS = 800;
const MIN_WORDS = 5;
const MAX_THEME_LENGTH = 100;

const UPSTREAM_TIMEOUT_MS = 12_000;

interface GenerateWordsRequest {
  theme?: unknown;
  wordCount?: unknown;
}
interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
    text?: string;
  }>;
}

function sanitizeTheme(theme: unknown) {
  return String(theme || "")
    .trim()
    .slice(0, MAX_THEME_LENGTH)
    .replace(/[<>"'`;]/g, "");
}

function json(
  res: VercelResponse,
  status: number,
  payload: Record<string, unknown>,
) {
  res.status(status).json(payload);
}

function normalizeWordList(words: readonly unknown[], limit: number): string[] {
  return [
    ...new Set(
      words
        .slice(0, limit)
        .filter(
          (word): word is string =>
            typeof word === "string" && /^[a-z]{2,20}$/i.test(word),
        )
        .map((word) => word.toLowerCase()),
    ),
  ];
}

function fallbackParseWordsFromText(text: unknown, limit: number) {
  const candidates = String(text || "")
    .replace(/[[\]{}"']/g, " ")
    .split(/[\s,\n\r;:|]+/)
    .filter(Boolean);

  return normalizeWordList(candidates, limit);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "method_not_allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(res, 401, { error: "server_not_configured" });
  }

  const contentType = req.headers["content-type"] || "";
  if (
    typeof contentType !== "string" ||
    !contentType.includes("application/json")
  ) {
    return json(res, 415, { error: "unsupported_media_type" });
  }

  let rawBody: GenerateWordsRequest = {};

  if (typeof req.body === "string") {
    try {
      rawBody = JSON.parse(req.body) as GenerateWordsRequest;
    } catch {
      return json(res, 400, { error: "invalid_payload" });
    }
  } else if (req.body && typeof req.body === "object") {
    rawBody = req.body as GenerateWordsRequest;
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

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate ${requestedCount} words about: ${sanitizedTheme}`,
            },
          ],
          temperature: 0.7,
          top_p: 0.95,
          max_tokens: 1024,
          n: 1,
        }),
      },
    );
    clearTimeout(timeout);

    if (!groqRes.ok) {
      const body = await groqRes.text();

      console.error("Groq HTTP status:", groqRes.status);
      console.error("Groq response:", body);

      if (groqRes.status === 429) {
        return json(res, 429, { error: "provider_rate_limited" });
      }

      return json(res, 502, {
        error: "provider_error",
        status: groqRes.status,
      });
    }

    const data: GroqResponse = await groqRes.json();
    const content =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;

    if (!content || typeof content !== "string") {
      return json(res, 502, { error: "invalid_provider_response" });
    }

    let words: string[] = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.words)) {
          words = normalizeWordList(parsed.words, requestedCount);
        }
      }
    } catch (error) {
      console.error(error);
      return json(res, 500, { error: "internal_error" });
    }

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
    });
  } catch {
    return json(res, 500, { error: "internal_error" });
  }
}

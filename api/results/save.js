import { parse } from "cookie";
import { verifyToken } from "../_lib/auth.js";
import { getPool } from "../_lib/db.js";

const pickColumn = (columns, candidates) =>
    candidates.find((name) => columns.has(name)) || null;

const q = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

function isValidAttempt(a) {
    return (
        a &&
        typeof a.id === "string" &&
        typeof a.wpm === "number" &&
        typeof a.accuracy === "number" &&
        typeof a.mode === "string" &&
        typeof a.language === "string" &&
        typeof a.timestamp === "number" &&
        (typeof a.aiGenerated === "boolean" || typeof a.aiGenerated === "undefined")
    );
}

/** Map an information_schema data_type string to the correct unnest() cast type. */
function pgUnnestType(dbType) {
    const t = String(dbType).toLowerCase();
    if (t === "uuid") return "uuid";
    if (t.includes("timestamp")) return "timestamptz";
    if (t === "integer" || t === "int" || t === "int2" || t === "int4" || t === "int8" || t === "bigint" || t === "smallint") return "int";
    if (t === "numeric" || t.includes("decimal")) return "numeric";
    if (t === "jsonb") return "jsonb";
    if (t === "json") return "json";
    if (t === "boolean" || t === "bool") return "boolean";
    return "text"; // varchar, text, char varying, etc.
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const cookies = parse(req.headers.cookie || "");
    if (!cookies.token) return res.status(401).json({ error: "Unauthorized" });

    const payload = await verifyToken(cookies.token);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    const { attempts } = req.body || {};
    if (!Array.isArray(attempts) || attempts.length === 0) {
        return res.status(400).json({ error: "attempts array required" });
    }

    // Filter out malformed records up front — never let one bad entry kill the batch.
    const valid = attempts.filter(isValidAttempt);
    if (valid.length === 0) {
        return res.status(400).json({ error: "no_valid_attempts" });
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
        // Run all schema migrations + column introspection in a single round-trip.
        await client.query(`
            DO $$
            BEGIN
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS raw_wpm INTEGER;
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS adjusted_wpm INTEGER;
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS error_rate NUMERIC(6,3);
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS time_per_char NUMERIC(10,4);
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS chars_per_second NUMERIC(10,4);
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS consistency NUMERIC(6,3);
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS keystrokes_per_second NUMERIC(10,4);
                ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN; -- <--
            EXCEPTION WHEN OTHERS THEN
                NULL; -- Ignore permission/schema errors, proceed with existing columns.
            END;
            $$;
        `);

        const colsResult = await client.query(
            `SELECT column_name, data_type
             FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'typing_results'`,
        );
        const columnMap = new Map(
            colsResult.rows.map((r) => [r.column_name, r.data_type]),
        );
        const columns = new Set(columnMap.keys());

        const idCol = pickColumn(columns, ["id"]);
        const userIdCol = pickColumn(columns, ["user_id", "userId"]);
        const wpmCol = pickColumn(columns, ["wpm"]);
        const accuracyCol = pickColumn(columns, ["accuracy"]);
        const elapsedCol = pickColumn(columns, [
            "elapsed",
            "duration",
            "time",
            "time_elapsed",
            "seconds",
            "time_taken",
        ]);
        const modeCol = pickColumn(columns, ["mode"]);
        const languageCol = pickColumn(columns, ["language", "lang"]);
        const errorsCol = pickColumn(columns, ["errors", "error_count", "mistakes"]);
        const totalTypedCol = pickColumn(columns, ["total_typed", "totalTyped"]);
        const correctCharsCol = pickColumn(columns, ["correct_chars", "correctChars"]);
        const timestampCol = pickColumn(columns, ["timestamp", "created_at"]);
        const rawWpmCol = pickColumn(columns, ["raw_wpm", "rawWpm"]);
        const adjustedWpmCol = pickColumn(columns, ["adjusted_wpm", "adjustedWpm"]);
        const errorRateCol = pickColumn(columns, ["error_rate", "errorRate"]);
        const timePerCharCol = pickColumn(columns, ["time_per_char", "timePerChar"]);
        const charsPerSecondCol = pickColumn(columns, ["chars_per_second", "charsPerSecond"]);
        const consistencyCol = pickColumn(columns, ["consistency"]);
        const keystrokesPerSecondCol = pickColumn(columns, [
            "keystrokes_per_second",
            "keystrokesPerSecond",
        ]);
        const aiGeneratedCol = pickColumn(columns, ["ai_generated", "aiGenerated"]); // <--

        // Heavy payload columns intentionally ignored to reduce storage:
        // target_text, char_status, performance_data

        const required = { idCol, userIdCol, wpmCol, accuracyCol, modeCol, languageCol };
        const missing = Object.entries(required)
            .filter(([, v]) => !v)
            .map(([k]) => k);
        if (missing.length > 0) {
            return res.status(500).json({ error: "schema_mismatch", missing });
        }

        // Build a single multi-row INSERT using unnest() arrays — one round-trip for all rows.
        // Use actual DB column types so uuid/timestamptz/etc. cast correctly.
        const col = (name) => name ? [name, pgUnnestType(columnMap.get(name))] : null;
        const colDefs = [
            col(idCol),
            col(userIdCol),
            col(wpmCol),
            col(accuracyCol),
            col(modeCol),
            col(languageCol),
            col(elapsedCol),
            col(errorsCol),
            col(totalTypedCol),
            col(correctCharsCol),
            col(rawWpmCol),
            col(adjustedWpmCol),
            col(errorRateCol),
            col(timePerCharCol),
            col(charsPerSecondCol),
            col(consistencyCol),
            col(keystrokesPerSecondCol),
            col(aiGeneratedCol), // <--
            col(timestampCol),
        ].filter(Boolean);

        const colNames = colDefs.map(([col]) => q(col)).join(", ");
        const colTypes = colDefs.map(([, type]) => type);

        // One flat array per column, used with unnest().
        const arrays = colDefs.map(() => []);

        const tsIsTimestamp = String(columnMap.get(timestampCol) || "").toLowerCase().includes("timestamp");

        for (const a of valid) {
            let i = 0;
            arrays[i++].push(a.id);
            arrays[i++].push(payload.userId);
            arrays[i++].push(a.wpm);
            arrays[i++].push(a.accuracy);
            arrays[i++].push(a.mode);
            arrays[i++].push(a.language);
            if (elapsedCol) arrays[i++].push(typeof a.elapsed === "number" ? a.elapsed : 0);
            if (errorsCol) arrays[i++].push(a.errors ?? 0);
            if (totalTypedCol) arrays[i++].push(a.totalTyped ?? 0);
            if (correctCharsCol) arrays[i++].push(a.correctChars ?? 0);
            if (rawWpmCol) arrays[i++].push(a.rawWpm ?? a.wpm ?? 0);
            if (adjustedWpmCol) arrays[i++].push(a.adjustedWpm ?? a.wpm ?? 0);
            if (errorRateCol) arrays[i++].push(a.errorRate ?? 0);
            if (timePerCharCol) arrays[i++].push(a.timePerChar ?? null);
            if (charsPerSecondCol) arrays[i++].push(a.charsPerSecond ?? null);
            if (consistencyCol) arrays[i++].push(a.consistency ?? null);
            if (keystrokesPerSecondCol) arrays[i++].push(a.keystrokesPerSecond ?? null);
            if (aiGeneratedCol) arrays[i++].push(Boolean(a.aiGenerated)); // <--
            if (timestampCol) arrays[i++].push(tsIsTimestamp ? new Date(a.timestamp) : a.timestamp);
        }

        // Build unnest($1::text[], $2::int[], ...) expression.
        const unnestArgs = colTypes.map((type, i) => `$${i + 1}::${type}[]`).join(", ");
        const unnestCols = colDefs.map(([col]) => q(col)).join(", ");

        const sql = `
            INSERT INTO typing_results (${colNames})
            SELECT ${unnestCols}
            FROM unnest(${unnestArgs}) AS t(${unnestCols})
            ON CONFLICT (${q(idCol)}) DO NOTHING
        `;

        const result = await client.query(sql, arrays);
        const synced = result.rowCount ?? 0;

        return res.status(200).json({ ok: true, synced, received: attempts.length, valid: valid.length });
    } catch (err) {
        console.error("[save] sync error:", err?.message ?? err);
        return res.status(500).json({ error: "sync_failed", detail: err?.message });
    } finally {
        client.release();
    }
}

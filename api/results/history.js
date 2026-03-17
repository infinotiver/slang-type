import { parse } from "cookie";
import { verifyToken } from "../_lib/auth.js";
import { getPool } from "../_lib/db.js";

const pickColumn = (columns, candidates) =>
    candidates.find((name) => columns.has(name)) || null;

const q = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const cookies = parse(req.headers.cookie || "");
    if (!cookies.token) return res.status(401).json({ error: "Unauthorized" });

    const payload = await verifyToken(cookies.token);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    const pool = getPool();

    const colsResult = await pool.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'typing_results'`,
    );

    const columns = new Set(colsResult.rows.map((r) => r.column_name));

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
   

    const required = {
        idCol,
        userIdCol,
        wpmCol,
        accuracyCol,
        modeCol,
        languageCol,
    };

    const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        return res.status(500).json({ error: "schema_mismatch", missing });
    }

    const sql = `SELECT
            ${q(idCol)} AS id,
            ${q(wpmCol)} AS wpm,
            ${q(accuracyCol)} AS accuracy,
            ${errorsCol ? `${q(errorsCol)}` : "0"} AS errors,
            ${elapsedCol ? `${q(elapsedCol)}` : "NULL"} AS elapsed,
            ${q(modeCol)} AS mode,
            ${q(languageCol)} AS language,
            ${totalTypedCol ? `${q(totalTypedCol)}` : "0"} AS "totalTyped",
            ${correctCharsCol ? `${q(correctCharsCol)}` : "0"} AS "correctChars",
            ${rawWpmCol ? `${q(rawWpmCol)}` : "NULL"} AS "rawWpm",
            ${adjustedWpmCol ? `${q(adjustedWpmCol)}` : "NULL"} AS "adjustedWpm",
            ${errorRateCol ? `${q(errorRateCol)}` : "NULL"} AS "errorRate",
            ${timePerCharCol ? `${q(timePerCharCol)}` : "NULL"} AS "timePerChar",
            ${charsPerSecondCol ? `${q(charsPerSecondCol)}` : "NULL"} AS "charsPerSecond",
            ${consistencyCol ? `${q(consistencyCol)}` : "NULL"} AS "consistency",
            ${keystrokesPerSecondCol ? `${q(keystrokesPerSecondCol)}` : "NULL"} AS "keystrokesPerSecond",
            ${timestampCol ? `${q(timestampCol)}` : "now()"} AS "rawTimestamp"
        FROM typing_results
        WHERE ${q(userIdCol)} = $1
        ORDER BY ${timestampCol ? q(timestampCol) : q(idCol)} DESC`;

    const { rows } = await pool.query(sql, [payload.userId]);

    const attempts = rows.map((row) => {
        const rawTs = row.rawTimestamp;
        let timestamp;
        if (typeof rawTs === "number") {
            timestamp = rawTs > 1_000_000_000_000 ? rawTs : rawTs * 1000;
        } else {
            const parsed = new Date(rawTs).getTime();
            timestamp = Number.isFinite(parsed) ? parsed : Date.now();
        }

        return {
            id: String(row.id),
            wpm: Number(row.wpm) || 0,
            accuracy: Number(row.accuracy) || 0,
            errors: Number(row.errors) || 0,
            elapsed:
                Number(row.elapsed) ||
                (typeof row.mode === "string" && /\d+/.test(row.mode)
                    ? Number(row.mode.match(/\d+/)?.[0] ?? 0)
                    : 0),
            mode: String(row.mode ?? ""),
            language: String(row.language ?? ""),
            totalTyped: Number(row.totalTyped) || 0,
            correctChars: Number(row.correctChars) || 0,
            rawWpm: row.rawWpm == null ? undefined : Number(row.rawWpm),
            adjustedWpm: row.adjustedWpm == null ? undefined : Number(row.adjustedWpm),
            errorRate: row.errorRate == null ? undefined : Number(row.errorRate),
            timePerChar: row.timePerChar == null ? undefined : Number(row.timePerChar),
            charsPerSecond:
                row.charsPerSecond == null ? undefined : Number(row.charsPerSecond),
            consistency: row.consistency == null ? undefined : Number(row.consistency),
            keystrokesPerSecond:
                row.keystrokesPerSecond == null
                    ? undefined
                    : Number(row.keystrokesPerSecond),
            timestamp,
        };
    });

    return res.status(200).json({ attempts });
}

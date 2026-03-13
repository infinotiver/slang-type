import { parse } from "cookie";
import { verifyToken } from "../_lib/auth.js";
import { getPool } from "../_lib/db.js";

const pickColumn = (columns, candidates) =>
    candidates.find((name) => columns.has(name)) || null;

const q = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

// Ensure table exists:
// CREATE TABLE IF NOT EXISTS typing_results (
//   id TEXT PRIMARY KEY,
//   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//   wpm INTEGER NOT NULL,
//   accuracy NUMERIC(5,2) NOT NULL,
//   errors INTEGER NOT NULL DEFAULT 0,
//   elapsed INTEGER NOT NULL,
//   mode TEXT NOT NULL,
//   language TEXT NOT NULL,
//   total_typed INTEGER NOT NULL DEFAULT 0,
//   correct_chars INTEGER NOT NULL DEFAULT 0,
//   timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
// );

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

    const pool = getPool();
    const client = await pool.connect();

    // Best effort: evolve table to store richer payload without breaking older DBs.
    try {
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS raw_wpm INTEGER`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS adjusted_wpm INTEGER`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS error_rate NUMERIC(6,3)`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS time_per_char NUMERIC(10,4)`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS chars_per_second NUMERIC(10,4)`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS consistency NUMERIC(6,3)`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS keystrokes_per_second NUMERIC(10,4)`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS target_text TEXT`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS char_status JSONB`);
        await client.query(`ALTER TABLE typing_results ADD COLUMN IF NOT EXISTS performance_data JSONB`);
    } catch {
        // Ignore migration permission issues and continue with existing columns.
    }

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
    const targetTextCol = pickColumn(columns, ["target_text", "targetText"]);
    const charStatusCol = pickColumn(columns, ["char_status", "charStatus"]);
    const performanceDataCol = pickColumn(columns, [
        "performance_data",
        "performanceData",
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
        client.release();
        return res.status(500).json({ error: "schema_mismatch", missing });
    }

    try {
        await client.query("BEGIN");

        let synced = 0;
        for (const a of attempts) {
            if (
                !a ||
                typeof a.id !== "string" ||
                typeof a.wpm !== "number" ||
                typeof a.accuracy !== "number" ||
                typeof a.mode !== "string" ||
                typeof a.language !== "string" ||
                typeof a.timestamp !== "number"
            ) {
                throw new Error("invalid_attempt_shape");
            }

            const insertCols = [
                idCol,
                userIdCol,
                wpmCol,
                accuracyCol,
                modeCol,
                languageCol,
            ];
            const values = [
                a.id,
                payload.userId,
                a.wpm,
                a.accuracy,
                a.mode,
                a.language,
            ];

            if (elapsedCol) {
                insertCols.push(elapsedCol);
                values.push(typeof a.elapsed === "number" ? a.elapsed : 0);
            }

            if (errorsCol) {
                insertCols.push(errorsCol);
                values.push(a.errors ?? 0);
            }
            if (totalTypedCol) {
                insertCols.push(totalTypedCol);
                values.push(a.totalTyped ?? 0);
            }
            if (correctCharsCol) {
                insertCols.push(correctCharsCol);
                values.push(a.correctChars ?? 0);
            }
            if (rawWpmCol) {
                insertCols.push(rawWpmCol);
                values.push(a.rawWpm ?? a.wpm ?? 0);
            }
            if (adjustedWpmCol) {
                insertCols.push(adjustedWpmCol);
                values.push(a.adjustedWpm ?? a.wpm ?? 0);
            }
            if (errorRateCol) {
                insertCols.push(errorRateCol);
                values.push(a.errorRate ?? 0);
            }
            if (timePerCharCol) {
                insertCols.push(timePerCharCol);
                values.push(a.timePerChar ?? null);
            }
            if (charsPerSecondCol) {
                insertCols.push(charsPerSecondCol);
                values.push(a.charsPerSecond ?? null);
            }
            if (consistencyCol) {
                insertCols.push(consistencyCol);
                values.push(a.consistency ?? null);
            }
            if (keystrokesPerSecondCol) {
                insertCols.push(keystrokesPerSecondCol);
                values.push(a.keystrokesPerSecond ?? null);
            }
            if (targetTextCol) {
                insertCols.push(targetTextCol);
                values.push(a.targetText ?? null);
            }
            if (charStatusCol) {
                insertCols.push(charStatusCol);
                values.push(a.charStatus ?? null);
            }
            if (performanceDataCol) {
                insertCols.push(performanceDataCol);
                values.push(a.performanceData ?? null);
            }
            if (timestampCol) {
                insertCols.push(timestampCol);
                const tsType = String(columnMap.get(timestampCol) || "").toLowerCase();
                values.push(tsType.includes("timestamp") ? new Date(a.timestamp) : a.timestamp);
            }

            const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
            const sql = `INSERT INTO typing_results (${insertCols.map(q).join(", ")})
                                     VALUES (${placeholders})
                                     ON CONFLICT (${q(idCol)}) DO NOTHING`;

            const result = await client.query(sql, values);

            synced += result.rowCount ?? 0;
        }

        await client.query("COMMIT");
        return res.status(200).json({ ok: true, synced, received: attempts.length });
    } catch {
        await client.query("ROLLBACK");
        return res.status(500).json({ error: "sync_failed" });
    } finally {
        client.release();
    }
}

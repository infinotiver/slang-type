import { getPool } from "../_lib/db.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const { elapsed, totalTyped } = req.body || {};
    const parsedElapsed = Number(elapsed ?? 0);
    const parsedTyped = Number(totalTyped ?? 0);

    if (!Number.isFinite(parsedElapsed) || parsedElapsed < 0) {
        return res.status(400).json({ error: "invalid_elapsed" });
    }
    if (!Number.isFinite(parsedTyped) || parsedTyped < 0) {
        return res.status(400).json({ error: "invalid_total_typed" });
    }

    const pool = getPool();
    await pool.query(`
        CREATE TABLE IF NOT EXISTS global_usage_summary (
            id boolean PRIMARY KEY DEFAULT true,
            tests_count bigint DEFAULT 0,
            total_typed_seconds bigint DEFAULT 0,
            updated_at timestamptz DEFAULT now()
        )
    `);

    await pool.query(
        `
        insert into global_usage_summary (id, tests_count, total_typed_seconds)
        values (true, 1, $1)
        on conflict (id)
        do update
          set tests_count = global_usage_summary.tests_count + 1,
              total_typed_seconds = global_usage_summary.total_typed_seconds + $1,
              updated_at = now()
    `,
        [parsedElapsed],
    );

    return res.status(204).end();
}

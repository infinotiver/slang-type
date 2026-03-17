import { getPool } from "./_lib/db.js"

const pickColumn = (columns, candidates) =>
    candidates.find((name) => columns.has(name)) || null;

const q = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

const ELAPSED_CANDIDATES = [
    "elapsed",
    "duration",
    "time",
    "time_elapsed",
    "seconds",
    "time_taken",
];

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    try {
        const pool = getPool();
        const colsResult = await pool.query(
            `SELECT column_name
             FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'typing_results'`,
        );
        const columns = new Set(colsResult.rows.map((r) => r.column_name));
        const elapsedCol = pickColumn(columns, ELAPSED_CANDIDATES);
        const elapsedExpr = elapsedCol ? `${q(elapsedCol)}::numeric` : "0";

        const usersQ = await pool.query(`select count(*)::int as count from users`);
        const testsQ = await pool.query(`
            select
              count(*)::int as tests_count,
              coalesce(sum(${elapsedExpr}), 0)::int as total_typed_seconds
            from typing_results
        `);

        return res.status(200).json({
            totalUsers: usersQ.rows[0]?.count ?? 0,
            totalTests: testsQ.rows[0]?.tests_count ?? 0,
            totalTypedSeconds: testsQ.rows[0]?.total_typed_seconds ?? 0,
        });
    } catch (error) {
        console.error("[stats] endpoint failed", error);
        return res.status(500).json({ error: "stats_failed", detail: error?.message });
    }
}

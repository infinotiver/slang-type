import { getPool } from "../_lib/db.js"

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    try {
        const pool = getPool();

        const [usersQ, testsQ, aiQ] = await Promise.all([
            pool.query(`select count(*)::int as count from users`),
            pool.query(`
        select
          count(*)::int as tests_count,
          coalesce(sum(elapsed), 0)::int as total_typed_seconds
        from typing_results
      `),
            pool.query(`select count(*)::int as count from ai_generations`),
        ]);
        return res.status(200).json({
            totalUsers: usersQ.rows[0]?.count ?? 0,
            totalTests: testsQ.rows[0]?.tests_count ?? 0,
            totalTypedSeconds: testsQ.rows[0]?.total_typed_seconds ?? 0,
            totalAiGenerations: aiQ.rows[0]?.count ?? 0,
        });
    } catch (error) {
        return res.status(500).json({ error: "stats_failed" });
    }
}
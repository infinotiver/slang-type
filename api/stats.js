import { getPool } from "./_lib/db.js";

async function ensureSummaryTable(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS global_usage_summary (
            id boolean PRIMARY KEY DEFAULT true,
            tests_count bigint DEFAULT 0,
            total_typed_seconds bigint DEFAULT 0,
            updated_at timestamptz DEFAULT now()
        )
    `);
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    try {
        const pool = getPool();
        await ensureSummaryTable(pool);

        const usersQ = await pool.query(`select count(*)::int as count from users`);
        const summaryQ = await pool.query(
            `select tests_count, total_typed_seconds from global_usage_summary where id = true`,
        );

        const summary = summaryQ.rows[0] ?? {
            tests_count: 0,
            total_typed_seconds: 0,
        };

        return res.status(200).json({
            totalUsers: usersQ.rows[0]?.count ?? 0,
            totalTests: Number(summary.tests_count || 0),
            totalTypedSeconds: Number(summary.total_typed_seconds || 0),
        });
    } catch (error) {
        console.error("[stats] endpoint failed", error);
        return res.status(500).json({ error: "stats_failed", detail: error?.message });
    }
}

import { getPool } from "./db.js";

const DEFAULT_DAILY_REQ_LIMIT = Number(process.env.AI_DAILY_REQ_LIMIT ?? 2);
const TODAY_SQL = "(now() at time zone 'UTC')::date";

async function cleanupOldRows(pool, userId) {
    await pool.query(
        `delete from ai_token_usage_daily where user_id = $1 and usage_date < ${TODAY_SQL}`,
        [userId],
    );
}

// Increment and check daily request quota for a user
export async function consumeDailyRequests(userId) {
    const pool = getPool();
    const limit = DEFAULT_DAILY_REQ_LIMIT;

    await cleanupOldRows(pool, userId);

    const q = await pool.query(
        `
        insert into ai_token_usage_daily (user_id, usage_date, tokens_used)
        values ($1, ${TODAY_SQL}, 1)
        on conflict (user_id, usage_date)
        do update
          set tokens_used = ai_token_usage_daily.tokens_used + 1,
              updated_at = now()
        where ai_token_usage_daily.tokens_used + 1 <= $2
        returning tokens_used
        `,
        [userId, limit],
    );

    if (q.rowCount === 0) {
        return { ok: false, limit, remaining: 0 };
    }
    const used = q.rows[0].tokens_used ?? 0;
    return { ok: true, limit, used, remaining: Math.max(0, limit - used) };
}

// Fetch daily request quota for a user
export async function getDailyRequestQuota(userId) {
    const pool = getPool();
    const limit = DEFAULT_DAILY_REQ_LIMIT;

    await cleanupOldRows(pool, userId);

    const q = await pool.query(
        `select tokens_used from ai_token_usage_daily where user_id = $1 and usage_date = ${TODAY_SQL}`,
        [userId],
    );

    const used = q.rows[0]?.tokens_used ?? 0;
    return {
        limit,
        used,
        remaining: Math.max(0, limit - used),
        resetAt: "00:00 UTC",
    };
}

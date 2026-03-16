import { getPool } from "./db.js";

const DEFAULT_DAILY_LIMIT = Number(process.env.AI_DAILY_TOKEN_LIMIT ?? 5000);

export function estimateTokens(theme, wordCount) {
    // simple conservative estimate
    const promptTokens = Math.ceil((String(theme ?? "").length + 220) / 4);
    const outputTokens = Math.ceil((Number(wordCount ?? 0) * 8) / 4);
    return Math.max(1, promptTokens + outputTokens);
}

export async function consumeDailyTokens(userId, tokensToConsume) {
    const pool = getPool();
    const limit = DEFAULT_DAILY_LIMIT;

    const q = await pool.query(
        `
    insert into ai_token_usage_daily (user_id, usage_date, tokens_used)
    values ($1, current_date, $2)
    on conflict (user_id, usage_date)
    do update
      set tokens_used = ai_token_usage_daily.tokens_used + excluded.tokens_used,
          updated_at = now()
    where ai_token_usage_daily.tokens_used + excluded.tokens_used <= $3
    returning tokens_used
    `,
        [userId, tokensToConsume, limit],
    );

    if (q.rowCount === 0) {
        return { ok: false, limit, remaining: 0 };
    }

    const used = q.rows[0].tokens_used;
    return { ok: true, limit, remaining: Math.max(0, limit - used), used };
}

export async function getDailyTokenQuota(userId) {
    const pool = getPool();
    const limit = DEFAULT_DAILY_LIMIT;

    const q = await pool.query(
        `select tokens_used from ai_token_usage_daily where user_id = $1 and usage_date = current_date`,
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
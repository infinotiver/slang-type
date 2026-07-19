// api/usage.ts
//
// GET  /api/usage           -> { testsCount, totalTypedSeconds, updatedAt }
// POST /api/usage           -> body: { elapsedSeconds: number }

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const MAX_ELAPSED_SECONDS = 24 * 60 * 60; // just, defensive not a real limit

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

// TODO: if this ever gets famous, implement redis or smthing
function isRateLimited(ip: string): boolean {
  // basic naive ratelimiting

  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function getClientIp(req: VercelRequest): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

type UsageRow = {
  tests_count: number | string;
  total_typed_seconds: number | string;
  updated_at: string;
};

function serializeUsage(row: UsageRow | undefined) {
  return {
    testsCount: row ? Number(row.tests_count) : 0,
    totalTypedSeconds: row ? Number(row.total_typed_seconds) : 0,
    updatedAt: row ? row.updated_at : null,
  };
}

async function handleGet(_req: VercelRequest, res: VercelResponse) {
  const rows = (await sql`
    SELECT tests_count, total_typed_seconds, updated_at
    FROM global_usage_summary
    WHERE id = true
    LIMIT 1;
  `) as UsageRow[];

  res.status(200).json(serializeUsage(rows[0]));
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    res.status(415).json({ error: "unsupported_media_type" });
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "rate_limited" });
    return;
  }

  const { elapsedSeconds } = (req.body ?? {}) as { elapsedSeconds?: unknown };

  if (
    typeof elapsedSeconds !== "number" ||
    !Number.isFinite(elapsedSeconds) ||
    elapsedSeconds < 0 ||
    elapsedSeconds > MAX_ELAPSED_SECONDS
  ) {
    res.status(400).json({ error: "invalid_elapsed_seconds" });
    return;
  }

  // Round to whole seconds.
  const seconds = Math.round(elapsedSeconds);

  try {
    // Atomic upsert: creates the singleton row on the very first completion,
    // otherwise increments both counters on the existing row in one
    // statement (no read-then-write race between concurrent requests).
    const rows = (await sql`
      INSERT INTO global_usage_summary (id, tests_count, total_typed_seconds, updated_at)
      VALUES (true, 1, ${seconds}, now())
      ON CONFLICT (id) DO UPDATE SET
        tests_count = global_usage_summary.tests_count + 1,
        total_typed_seconds = global_usage_summary.total_typed_seconds + EXCLUDED.total_typed_seconds,
        updated_at = now()
      RETURNING tests_count, total_typed_seconds, updated_at;
    `) as UsageRow[];

    res.status(200).json(serializeUsage(rows[0]));
  } catch (err) {
    console.error("[usage] upsert failed:", err);
    res.status(500).json({ error: "server_error" });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    await handleGet(req, res);
    return;
  }
  if (req.method === "POST") {
    await handlePost(req, res);
    return;
  }
  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ error: "method_not_allowed" });
}

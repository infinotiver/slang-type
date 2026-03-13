import { parse } from "cookie";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

interface ApiRequest {
  headers: {
    cookie?: string;
  };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => ApiResponse;
}

export default async function meHandler(req: ApiRequest, res: ApiResponse) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { rows } = await pool.query(
    "SELECT id, email, username FROM users WHERE id = $1 LIMIT 1",
    [payload.userId],
  );

  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({ user });
}

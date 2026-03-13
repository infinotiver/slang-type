import { pool } from "../../lib/db";
import { verifyToken } from "../../lib/auth";
import { parse } from "cookie";

interface ApiRequest {
  headers: {
    cookie?: string;
  };
  body: {
    wpm: number;
    accuracy: number;
    mode: string;
    language: string;
  };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => ApiResponse;
}

export default async function saveResult(req: ApiRequest, res: ApiResponse) {
  const cookies = parse(req.headers.cookie || "");

  if (!cookies.token) {
    return res.status(401).json({ error: "Login required" });
  }

  const decoded = await verifyToken(cookies.token);

  if (!decoded) return res.status(401).json({ error: "Login required" });

  const { wpm, accuracy, mode, language } = req.body;

  await pool.query(
    "INSERT INTO typing_results (user_id, wpm, accuracy, mode, language) VALUES ($1, $2, $3, $4, $5)",
    [decoded.userId, wpm, accuracy, mode, language],
  );

  return res.status(200).json({ success: true });
}

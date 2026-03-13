import { pool } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";

interface ApiRequest {
  body: {
    email?: string;
    password?: string;
  };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => ApiResponse;
  setHeader: (name: string, value: string) => void;
}

export default async function loginHandler(req: ApiRequest, res: ApiResponse) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = rows[0];

  if (!user || !(await comparePassword(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = await generateToken({ userId: user.id, email: user.email });

  // Set as HttpOnly Cookie (Browser cannot read this, only the server can)
  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
  );

  return res.json({ user: { id: user.id, username: user.username } });
}

import { pool } from "@/lib/db";
import { generateToken, hashPassword } from "@/lib/auth";

interface ApiRequest {
  body: {
    email?: string;
    password?: string;
    username?: string;
  };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => ApiResponse;
  setHeader: (name: string, value: string) => void;
}

export default async function registerHandler(
  req: ApiRequest,
  res: ApiResponse,
) {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const username = req.body.username?.trim() || null;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 chars" });
  }

  try {
    const passwordHash = await hashPassword(password);

    const { rows } = await pool.query(
      "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username",
      [email, username, passwordHash],
    );

    const user = rows[0];
    const token = await generateToken({ userId: user.id, email: user.email });

    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
    );

    return res.status(201).json({ user });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({ error: "Email already registered" });
    }

    return res.status(500).json({ error: "Signup failed" });
  }
}

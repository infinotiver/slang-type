import { getPool } from "../_lib/db.js";
import { hashPassword, generateToken } from "../_lib/auth.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const { email, password, username } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const pool = getPool();

    try {
        const passwordHash = await hashPassword(password);
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username?.trim() || null;

        const { rows } = await pool.query(
            "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username",
            [cleanEmail, cleanUsername, passwordHash]
        );

        const user = rows[0];
        const token = await generateToken({ userId: user.id, email: user.email });

        res.setHeader(
            "Set-Cookie",
            `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
        );

        return res.status(201).json({ user });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Email already registered" });
        }
        console.error("register error:", error.message);
        return res.status(500).json({ error: "Signup failed" });
    }
}

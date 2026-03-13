import { getPool } from "../_lib/db.js";
import { comparePassword, generateToken } from "../_lib/auth.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const pool = getPool();
    const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1 LIMIT 1",
        [email.trim().toLowerCase()]
    );
    const user = rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = await generateToken({ userId: user.id, email: user.email });

    res.setHeader(
        "Set-Cookie",
        `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
    );

    return res.status(200).json({ user: { id: user.id, email: user.email, username: user.username } });
}

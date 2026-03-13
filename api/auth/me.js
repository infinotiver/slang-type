import { parse } from "cookie";
import { verifyToken } from "../_lib/auth.js";
import { getPool } from "../_lib/db.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "method_not_allowed" });
    }

    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const pool = getPool();
    const { rows } = await pool.query(
        "SELECT id, email, username FROM users WHERE id = $1 LIMIT 1",
        [payload.userId]
    );

    const user = rows[0];
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json({ user });
}

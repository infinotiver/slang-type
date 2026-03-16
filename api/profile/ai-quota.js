import { requireUser } from "../_lib/auth.js";
import { getDailyTokenQuota } from "../_lib/aiQuota.js";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

    const user = await requireUser(req);
    if (!user) return res.status(401).json({ error: "unauthorized" });

    const quota = await getDailyTokenQuota(user.id);
    return res.status(200).json(quota);
}
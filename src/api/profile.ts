import axios from "@/lib/axiosConfig";

export interface AiQuota {
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

export async function fetchAiQuota() {
  const { data } = await axios.get<AiQuota>("/profile/ai-quota");
  return data;
}

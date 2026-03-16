import axios from "@/lib/axiosConfig";

export interface OverviewStats {
  totalUsers: number;
  totalTests: number;
  totalTypedSeconds: number;
  totalAiGenerations: number;
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const { data } = await axios.get<OverviewStats>("/stats");
  return data;
}

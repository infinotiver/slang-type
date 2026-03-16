import api from "@/lib/axiosConfig";
import type { TypingAttempt } from "@shared-types/index";

export interface SaveAttemptsResponse {
  ok: boolean;
  synced: number;
  received: number;
  valid?: number;
}

export async function saveAttempts(
  attempts: TypingAttempt[],
): Promise<SaveAttemptsResponse> {
  const response = await api.post<SaveAttemptsResponse>("/results/save", {
    attempts,
  });

  if (response.status !== 200 || !response.data?.ok) {
    throw new Error("sync_not_confirmed");
  }

  return response.data;
}

export async function fetchHistory(): Promise<{ attempts: TypingAttempt[] }> {
  const { data } = await api.get<{ attempts: TypingAttempt[] }>(
    "/results/history",
  );
  return data;
}

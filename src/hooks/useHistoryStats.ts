import { useMemo } from "react";
import useLocalStorage from "./useLocalStorage";
import {
  calculateAllStats,
  calculateWpmProgressionData,
} from "../utils/historyStats";
import type {
  HistoryStats,
  StatsByLanguage,
  WpmProgressionPoint,
} from "../utils/historyStats";
import type { TypingAttempt } from "../types";

export interface UseHistoryStatsReturn {
  attempts: TypingAttempt[];
  allAttempts: TypingAttempt[];
  stats: HistoryStats;
  statsByLanguage: StatsByLanguage;
  statsByMode: Record<string, TypingAttempt | null>;
  wpmProgressionData: WpmProgressionPoint[];
}

export function useHistoryStats(): UseHistoryStatsReturn {
  const [attempts] = useLocalStorage<TypingAttempt[]>("slangtype_attempts", []);

  const allAttempts = useMemo(() => [...attempts].reverse(), [attempts]);

  // Single pass calculation for all stats
  const { stats, statsByLanguage, statsByMode } = useMemo(
    () => calculateAllStats(attempts),
    [attempts],
  );

  const wpmProgressionData = useMemo(
    () => calculateWpmProgressionData(attempts),
    [attempts],
  );

  return {
    attempts,
    allAttempts,
    stats,
    statsByLanguage,
    statsByMode,
    wpmProgressionData,
  };
}

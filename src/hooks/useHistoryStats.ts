import { useMemo, useCallback } from "react";
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
  stats: HistoryStats;
  statsByLanguage: StatsByLanguage;
  statsByMode: Record<string, TypingAttempt | null>;
  wpmProgressionData: WpmProgressionPoint[];
  addAttempt: (attempt: TypingAttempt) => void;
}


export function useHistoryStats(): UseHistoryStatsReturn {
  const [attempts, setAttempts] = useLocalStorage<TypingAttempt[]>(
    "slangtype_attempts",
    [],
  );

  // Single pass calculation for all stats
  const { stats, statsByLanguage, statsByMode } = useMemo(
    () => calculateAllStats(attempts),
    [attempts],
  );

  const wpmProgressionData = useMemo(
    () => calculateWpmProgressionData(attempts),
    [attempts],
  );

  const addAttempt = useCallback(
    (attempt: TypingAttempt) => {
      setAttempts((prevAttempts) => [...prevAttempts, attempt]);
    },
    [setAttempts],
  );

  return {
    attempts,
    stats,
    statsByLanguage,
    statsByMode,
    wpmProgressionData,
    addAttempt,
  };
}

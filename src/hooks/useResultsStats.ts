import { useMemo } from "react";
import {
  computeResultsStats,
  type ComputeResultsStatsInput,
  type UnifiedResultsStats,
} from "@utils/resultsCalculations";

export type ComputedStats = UnifiedResultsStats;

type ResultsData = ComputeResultsStatsInput;

/**
 * Custom hook to compute all result statistics with proper memoization
 * Handles all calculation logic and returns clean, typed results
 */
export function useResultsStats(data: ResultsData): ComputedStats {
  return useMemo(
    () => computeResultsStats(data),
    [
      data.elapsed,
      data.totalTyped,
      data.errors,
      data.correctChars,
      data.accuracy,
      data.charStatus,
    ],
  );
}

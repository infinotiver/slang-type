import { useMemo } from "react";
import {
  calculateResultStats,
  generateWpmProgressionData,
  countCharStatuses,
  calculateConsistency,
  calculateWordMetrics,
} from "@utils/resultsCalculations";

export interface ComputedStats {
  // Core metrics
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  errorRate: string;

  // Character metrics
  correctChars: number;
  incorrectChars: number;
  pendingChars: number;

  // Word metrics
  wordsTyped: number;
  correctWords: number;

  // Derived metrics
  timePerChar: string;
  charsPerSecond: string;
  consistency: number;
  keystrokesPerSecond: string;

  // Chart data
  performanceData: Array<{
    name: number;
    wpm: number;
    accuracy: number;
    errorRate: number;
  }>;
}

interface ResultsData {
  elapsed: number;
  totalTyped: number;
  correctChars: number;
  accuracy: number;
  charStatus: Record<number, "pending" | "correct" | "incorrect">;
}

/**
 * Custom hook to compute all result statistics with proper memoization
 * Handles all calculation logic and returns clean, typed results
 */
export function useResultsStats(data: ResultsData): ComputedStats {
  const { elapsed, totalTyped, correctChars, accuracy, charStatus } = data;

  // Calculate base statistics
  const stats = useMemo(
    () =>
      calculateResultStats(
        elapsed,
        totalTyped,
        correctChars,
        accuracy,
        charStatus,
      ),
    [elapsed, totalTyped, correctChars, accuracy, charStatus],
  );

  // Count character statuses
  const statusCounts = useMemo(
    () => countCharStatuses(charStatus),
    [charStatus],
  );

  // Calculate word metrics
  const wordMetrics = useMemo(
    () => calculateWordMetrics(totalTyped, statusCounts.correct),
    [totalTyped, statusCounts.correct],
  );

  // Calculate consistency
  const consistency = useMemo(
    () => calculateConsistency(accuracy, stats.errorRate),
    [accuracy, stats.errorRate],
  );

  // Generate chart data
  const chartData = useMemo(
    () =>
      generateWpmProgressionData(
        elapsed,
        totalTyped,
        correctChars,
        charStatus,
        accuracy,
      ),
    [elapsed, totalTyped, correctChars, charStatus, accuracy],
  );

  // Format chart data for display
  const performanceData = useMemo(
    () =>
      chartData.map((point) => ({
        name: point.time, // Time in seconds
        wpm: point.adjustedWpm,
        rawWpm: point.rawWpm,
        accuracy: point.accuracy,
        errorRate: point.errorRate,
      })),
    [chartData],
  );

  // Calculate additional derived metrics
  const keystrokesPerSecond = useMemo(
    () => (totalTyped / Math.max(elapsed, 0.0167)).toFixed(2),
    [totalTyped, elapsed],
  );

  return {
    // Core metrics
    netWpm: stats.adjustedWpm,
    grossWpm: stats.rawWpm,
    accuracy: stats.accuracy,
    errorRate: stats.errorRate,

    // Character metrics
    correctChars: statusCounts.correct,
    incorrectChars: statusCounts.incorrect,
    pendingChars: statusCounts.pending,

    // Word metrics
    wordsTyped: wordMetrics.wordsTyped,
    correctWords: wordMetrics.correctWords,

    // Derived metrics
    timePerChar: stats.timePerChar,
    charsPerSecond: stats.charsPerSecond,
    consistency,
    keystrokesPerSecond,

    // Chart data
    performanceData,
  };
}

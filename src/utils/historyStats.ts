import type { TypingAttempt } from "../types";

export interface HistoryStats {
  totalAttempts: number;
  totalCharsTyped: number;
  bestWpm: number;
  avgWpm: number;
  bestAccuracy: number;
  avgAccuracy: number;
  totalTime: number;
}

export interface StatsByLanguage {
  slang: TypingAttempt | null;
  english: TypingAttempt | null;
  code: TypingAttempt | null;
}

export interface WpmProgressionPoint {
  name: number;
  wpm: number;
  accuracy: number;
}

interface AllStatsResult {
  stats: HistoryStats;
  statsByLanguage: StatsByLanguage;
  statsByMode: Record<string, TypingAttempt | null>;
}

/**
 * Calculate all stats in a single pass to avoid repeated loops
 */
export function calculateAllStats(attempts: TypingAttempt[]): AllStatsResult {
  let totalAttempts = 0;
  let totalCharsTyped = 0;
  let bestWpm = 0;
  let totalWpm = 0;
  let bestAccuracy = 0;
  let totalAccuracy = 0;
  let totalTime = 0;

  const statsByLanguage: StatsByLanguage = {
    slang: null,
    english: null,
    code: null,
  };

  const statsByMode: Record<string, TypingAttempt | null> = {};

  for (const attempt of attempts) {
    totalAttempts++;
    totalCharsTyped += attempt.totalTyped;
    totalWpm += attempt.wpm;
    totalAccuracy += attempt.accuracy;
    totalTime += attempt.elapsed;

    if (attempt.wpm > bestWpm) {
      bestWpm = attempt.wpm;
    }

    if (attempt.accuracy > bestAccuracy) {
      bestAccuracy = attempt.accuracy;
    }

    // Track best by language
    if (
      statsByLanguage[attempt.language as keyof StatsByLanguage] === null ||
      attempt.wpm >
        (statsByLanguage[attempt.language as keyof StatsByLanguage]?.wpm || 0)
    ) {
      statsByLanguage[attempt.language as keyof StatsByLanguage] = attempt;
    }

    // Track best by mode
    if (
      !statsByMode[attempt.mode] ||
      attempt.wpm > statsByMode[attempt.mode]!.wpm
    ) {
      statsByMode[attempt.mode] = attempt;
    }
  }

  return {
    stats: {
      totalAttempts,
      totalCharsTyped,
      bestWpm,
      avgWpm: totalAttempts > 0 ? Math.round(totalWpm / totalAttempts) : 0,
      bestAccuracy,
      avgAccuracy:
        totalAttempts > 0 ? Math.round(totalAccuracy / totalAttempts) : 0,
      totalTime,
    },
    statsByLanguage,
    statsByMode,
  };
}

/**
 * Generate WPM progression chart data
 */
export function calculateWpmProgressionData(
  attempts: TypingAttempt[],
): WpmProgressionPoint[] {
  const allAttempts = [...attempts].reverse();
  return allAttempts.map((attempt, idx) => ({
    name: idx + 1,
    wpm: attempt.wpm,
    accuracy: Math.round(attempt.accuracy),
  }));
}

// Keep legacy functions for backward compatibility if needed
export function calculateStats(attempts: TypingAttempt[]): HistoryStats {
  return calculateAllStats(attempts).stats;
}

export function calculateStatsByLanguage(
  attempts: TypingAttempt[],
): StatsByLanguage {
  return calculateAllStats(attempts).statsByLanguage;
}

export function calculateStatsByMode(
  attempts: TypingAttempt[],
): Record<string, TypingAttempt | null> {
  return calculateAllStats(attempts).statsByMode;
}

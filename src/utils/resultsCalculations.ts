// Utility functions for results calculations and charting

export interface ResultStats {
  adjustedWpm: number;
  rawWpm: number;
  accuracy: number;
  errorRate: string;
  incorrectChars: number;
  timePerChar: string;
  charsPerSecond: string;
}

export interface ChartDataPoint {
  time: number;
  adjustedWpm: number;
  rawWpm: number;
  errorRate: number;
  accuracy: number;
}

export interface CharStatusCounts {
  correct: number;
  incorrect: number;
  pending: number;
}

/**
 * Calculate comprehensive result statistics
 */
export function calculateResultStats(
  elapsed: number,
  totalTyped: number,
  _correctChars: number,
  accuracy: number,
  charStatus: Record<number, "pending" | "correct" | "incorrect">,
): ResultStats {
  const minutesElapsed = Math.max(elapsed / 60, 0.0167); // Minimum 1 second to avoid division by zero
  const statusCounts = countCharStatuses(charStatus);
  const incorrectChars = statusCounts.incorrect;
  const errorRate =
    totalTyped > 0 ? ((incorrectChars / totalTyped) * 100).toFixed(1) : "0.0";
  const rawWpm =
    totalTyped > 0 ? Math.round(totalTyped / 5 / minutesElapsed) : 0;
  const adjustedWpm = Math.round((Math.round(accuracy) / 100) * rawWpm);
  const timePerChar =
    totalTyped > 0 ? (elapsed / totalTyped).toFixed(2) : "0.00";
  const charsPerSecond = (totalTyped / elapsed).toFixed(2);

  return {
    adjustedWpm,
    rawWpm,
    accuracy: Math.round(accuracy),
    errorRate,
    incorrectChars,
    timePerChar,
    charsPerSecond,
  };
}

/**
 * Count character statuses from charStatus map
 */
export function countCharStatuses(
  charStatus: Record<number, "pending" | "correct" | "incorrect">,
): CharStatusCounts {
  const counts: CharStatusCounts = {
    correct: 0,
    incorrect: 0,
    pending: 0,
  };

  Object.values(charStatus).forEach((status) => {
    counts[status]++;
  });

  return counts;
}

/**
 * Generate WPM progression chart data from actual typing data
 * Uses the final stats to create a simple progression curve
 */
export function generateWpmProgressionData(
  elapsed: number,
  totalTyped: number,
  _correctChars: number,
  _charStatus: Record<number, "pending" | "correct" | "incorrect">,
  accuracy: number,
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];

  // Create data points at regular intervals (every second or every 10% of test)
  const interval = Math.max(1, Math.ceil(elapsed / 15)); // Target ~15 points max

  for (let second = interval; second <= elapsed; second += interval) {
    // Linear interpolation for character progress
    const progressRatio = second / elapsed;
    const estimatedTyped = Math.floor(totalTyped * progressRatio);
    const estimatedCorrect = Math.floor(totalTyped * (accuracy / 100) * progressRatio);
    const estimatedIncorrect = estimatedTyped - estimatedCorrect;

    const minutesElapsed = Math.max(second / 60, 0.0167);

    // Calculate metrics at this point in time
    const rawWpm =
      estimatedTyped > 0 ? Math.round(estimatedTyped / 5 / minutesElapsed) : 0;
    const errorRate =
      estimatedTyped > 0
        ? Math.round((estimatedIncorrect / estimatedTyped) * 100)
        : 0;
    const estimatedAccuracy =
      estimatedTyped > 0
        ? Math.round((estimatedCorrect / estimatedTyped) * 100)
        : 0;
    const adjustedWpm = Math.round((estimatedAccuracy / 100) * rawWpm);

    data.push({
      time: second,
      adjustedWpm: Math.max(0, adjustedWpm),
      rawWpm: Math.max(0, rawWpm),
      errorRate: Math.max(0, errorRate),
      accuracy: Math.max(0, estimatedAccuracy),
    });
  }

  // Ensure we have at least one data point (the final state)
  return data.length > 0
    ? data
    : [
        {
          time: elapsed,
          rawWpm: Math.round(totalTyped / 5 / (elapsed / 60)),
          adjustedWpm: Math.round(
            (Math.round(accuracy) / 100) *
              Math.round(totalTyped / 5 / (elapsed / 60)),
          ),
          errorRate: Math.round((1 - accuracy / 100) * 100),
          accuracy: Math.round(accuracy),
        },
      ];
}

/**
 * Format tooltip styling for recharts
 */
export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "rgb(31, 41, 55)",
    border: "1px solid rgb(75, 85, 99)",
    borderRadius: "6px",
    color: "rgb(243, 244, 246)",
    fontSize: "12px",
  },
  labelStyle: {
    color: "rgb(243, 244, 246)",
  },
};

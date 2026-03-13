// Utility functions for results calculations and charting
// All calculations are mathematically sound and follow typing test conventions

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
  errorsAtThisSecond: number;
}

export interface CharStatusCounts {
  correct: number;
  incorrect: number;
  pending: number;
}

export interface WordMetrics {
  wordsTyped: number;
  correctWords: number;
}

/**
 * Calculate WPM based on 5 characters = 1 word standard
 * @param totalChars - Total characters typed
 * @param minutesElapsed - Time in minutes
 * @returns WPM rounded to nearest integer
 */
function calculateWpm(totalChars: number, minutesElapsed: number): number {
  if (totalChars <= 0 || minutesElapsed <= 0) return 0;
  const wordsTyped = totalChars / 5; // Standard: 5 chars = 1 word
  return Math.round(wordsTyped / minutesElapsed);
}

/**
 * Calculate error rate as percentage
 * @param totalTyped - Total characters typed
 * @param incorrectChars - Number of incorrect characters
 * @returns Error rate as formatted string percentage
 */
function calculateErrorRate(
  totalTyped: number,
  incorrectChars: number,
): string {
  if (totalTyped <= 0) return "0.0";
  const rate = (incorrectChars / totalTyped) * 100;
  return rate.toFixed(1);
}

/**
 * Calculate time per character
 * @param elapsed - Total time in seconds
 * @param totalTyped - Total characters typed
 * @returns Time per character in seconds (formatted)
 */
function calculateTimePerChar(elapsed: number, totalTyped: number): string {
  if (totalTyped <= 0) return "0.00";
  return (elapsed / totalTyped).toFixed(2);
}

/**
 * Calculate characters per second
 * @param totalTyped - Total characters typed
 * @param elapsed - Total time in seconds
 * @returns Characters per second (formatted)
 */
function calculateCharsPerSecond(totalTyped: number, elapsed: number): string {
  if (elapsed <= 0) return "0.00";
  return (totalTyped / elapsed).toFixed(2);
}

/**
 * Calculate consistency score (inverse of error rate normalized to accuracy)
 * @param accuracy - Accuracy percentage (0-100)
 * @param errorRate - Error rate as string percentage
 * @returns Consistency percentage (0-100)
 */
export function calculateConsistency(
  accuracy: number,
  errorRate: string,
): number {
  const errorNum = parseFloat(errorRate);
  // Combine accuracy and inverse error rate for a stability/consistency score
  const inverseError = Math.max(0, 100 - errorNum);
  const score = Math.round((accuracy + inverseError) / 2);
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate word metrics based on character counts
 * @param totalTyped - Total characters typed
 * @param correctChars - Number of correct characters
 * @returns Word metrics object
 */
export function calculateWordMetrics(
  totalTyped: number,
  correctChars: number,
): WordMetrics {
  return {
    wordsTyped: Math.round(totalTyped / 5),
    correctWords: Math.round(correctChars / 5),
  };
}

/**
 * Calculate comprehensive result statistics
 * Follows standard typing test conventions (5 chars = 1 word)
 */
export function calculateResultStats(
  elapsed: number,
  totalTyped: number,
  accuracy: number,
  charStatus: Record<number, "pending" | "correct" | "incorrect">,
): ResultStats {
  const minutesElapsed = Math.max(elapsed / 60, 0.0167); // Minimum 1 second to avoid division by zero
  const statusCounts = countCharStatuses(charStatus);
  const incorrectChars = statusCounts.incorrect;

  // Calculate base metrics using helper functions
  const errorRate = calculateErrorRate(totalTyped, incorrectChars);
  const rawWpm = calculateWpm(totalTyped, minutesElapsed);
  const adjustedWpm = Math.round((Math.round(accuracy) / 100) * rawWpm);
  const timePerChar = calculateTimePerChar(elapsed, totalTyped);
  const charsPerSecond = calculateCharsPerSecond(totalTyped, elapsed);

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
 * Uses actual charStatus to calculate real error rates at each point
 */
export function generateWpmProgressionData(
  elapsed: number,
  totalTyped: number,
  charStatus: Record<number, "pending" | "correct" | "incorrect">,
  accuracy: number,
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];

  let previousSecondCharCount = 0; // Track where last second ended

  // Loop every second
  for (let second = 1; second <= elapsed; second++) {
    // Calculate progress ratio for this time point
    const progressRatio = second / elapsed;

    // Estimate character count at this point based on linear typing progress
    const estimatedTypedCount = Math.floor(totalTyped * progressRatio);

    // Skip if no characters typed yet
    if (estimatedTypedCount === 0) continue;

    // Count ONLY errors in THIS second (from previousSecondCharCount to estimatedTypedCount)
    let errorsAtThisSecond = 0;

    for (let i = previousSecondCharCount; i < estimatedTypedCount; i++) {
      const status = charStatus[i];
      if (status === "incorrect") {
        errorsAtThisSecond++;
      }
    }

    // Count cumulative stats up to this point (for WPM/accuracy calculation)
    let cumulativeCorrect = 0;
    let cumulativeIncorrect = 0;

    for (let i = 0; i < estimatedTypedCount; i++) {
      const status = charStatus[i];
      if (status === "correct") {
        cumulativeCorrect++;
      } else if (status === "incorrect") {
        cumulativeIncorrect++;
      }
    }

    const minutesElapsed = second / 60;

    // Calculate metrics using CUMULATIVE data for WPM/accuracy
    const rawWpm = Math.round(estimatedTypedCount / 5 / minutesElapsed);

    const cumulativeErrorRate =
      estimatedTypedCount > 0
        ? Math.round((cumulativeIncorrect / estimatedTypedCount) * 100)
        : 0;

    const cumulativeAccuracy =
      estimatedTypedCount > 0
        ? Math.round((cumulativeCorrect / estimatedTypedCount) * 100)
        : 0;

    const adjustedWpm = Math.round((cumulativeAccuracy / 100) * rawWpm);

    data.push({
      time: second,
      adjustedWpm: Math.max(0, adjustedWpm),
      rawWpm: Math.max(0, rawWpm),
      errorRate: Math.max(0, cumulativeErrorRate), // Cumulative for trend
      accuracy: Math.max(0, cumulativeAccuracy), // Cumulative for trend
      errorsAtThisSecond: errorsAtThisSecond,
    });

    // Update for next iteration
    previousSecondCharCount = estimatedTypedCount;
  }

  // Ensure we always have the final data point
  if (data.length === 0 || data[data.length - 1].time !== elapsed) {
    const finalStatusCounts = countCharStatuses(charStatus);
    const finalErrorRate =
      totalTyped > 0
        ? Math.round((finalStatusCounts.incorrect / totalTyped) * 100)
        : 0;

    const finalRawWpm = Math.round(totalTyped / 5 / (elapsed / 60));
    const finalAdjustedWpm = Math.round(
      (Math.round(accuracy) / 100) * finalRawWpm,
    );

    // Count errors in final second only
    let finalSecondErrors = 0;
    const startOfFinalSecond = Math.floor(
      totalTyped * ((elapsed - 1) / elapsed),
    );

    for (let i = startOfFinalSecond; i < totalTyped; i++) {
      if (charStatus[i] === "incorrect") {
        finalSecondErrors++;
      }
    }

    data.push({
      time: elapsed,
      rawWpm: finalRawWpm,
      adjustedWpm: finalAdjustedWpm,
      errorRate: finalErrorRate,
      accuracy: Math.round(accuracy),
      errorsAtThisSecond: finalSecondErrors,
    });
  }

  return data;
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

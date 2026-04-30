// Utility functions for results calculations and charting
// Single source of truth for all results metrics

export interface ResultStats {
  adjustedWpm: number;
  rawWpm: number;
  accuracy: number;
  errorRate: number;
  incorrectChars: number;
  timePerChar: number;
  charsPerSecond: number;
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

export interface ComputeResultsStatsInput {
  elapsed: number;
  totalTyped: number;
  errors: number;
  correctChars: number;
  accuracy: number;
  charStatus: Record<number, "pending" | "correct" | "incorrect">;
}

export interface UnifiedResultsStats {
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  errorRate: number;
  correctChars: number;
  incorrectChars: number;
  pendingChars: number;
  wordsTyped: number;
  correctWords: number;
  timePerChar: number;
  charsPerSecond: number;
  consistency: number;
  keystrokesPerSecond: number;
  performanceData: Array<{
    name: number;
    wpm: number;
    rawWpm: number;
    accuracy: number;
    errorRate: number;
    errorsAtThisSecond: number;
  }>;
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

function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
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
): number {
  if (totalTyped <= 0) return 0;
  const rate = (incorrectChars / totalTyped) * 100;
  return roundTo(rate, 1);
}

/**
 * Calculate time per character
 * @param elapsed - Total time in seconds
 * @param totalTyped - Total characters typed
 * @returns Time per character in seconds (formatted)
 */
function calculateTimePerChar(charsPerSecond: number): number {
  if (charsPerSecond <= 0) return 0;
  return roundTo(1 / charsPerSecond, 2);
}

/**
 * Calculate characters per second
 * @param totalTyped - Total characters typed
 * @param elapsed - Total time in seconds
 * @returns Characters per second (formatted)
 */
function calculateCharsPerSecondFromAdjustedWpm(adjustedWpm: number): number {
  if (adjustedWpm <= 0) return 0;
  return roundTo((adjustedWpm * 5) / 60, 2);
}

/**
 * Calculate consistency score (inverse of error rate normalized to accuracy)
 * @param accuracy - Accuracy percentage (0-100)
 * @param errorRate - Error rate as string percentage
 * @returns Consistency percentage (0-100)
 */
export function calculateConsistency(
  accuracy: number,
  errorRate: number,
): number {
  // Combine accuracy and inverse error rate for a stability/consistency score
  const inverseError = Math.max(0, 100 - errorRate);
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
    wordsTyped: Math.floor(totalTyped / 5),
    correctWords: Math.floor(correctChars / 5),
  };
}

/**
 * Calculate comprehensive result statistics
 * Follows standard typing test conventions (5 chars = 1 word)
 */
export function calculateResultStats(
  elapsed: number,
  totalTyped: number,
  totalMistakes: number,
  accuracy: number,
  charStatus: Record<number, "pending" | "correct" | "incorrect">,
): ResultStats {
  const minutesElapsed = Math.max(elapsed / 60, 0.0167); // Minimum 1 second to avoid division by zero
  const statusCounts = countCharStatuses(charStatus);
  const incorrectChars = statusCounts.incorrect;

  // Calculate base metrics using helper functions
  const errorRate = calculateErrorRate(totalTyped, totalMistakes);
  const rawWpm = calculateWpm(totalTyped, minutesElapsed);
  const adjustedWpm = Math.round((Math.round(accuracy) / 100) * rawWpm);
  const charsPerSecond = calculateCharsPerSecondFromAdjustedWpm(adjustedWpm);
  const timePerChar = calculateTimePerChar(charsPerSecond);

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
 * Generate WPM progression chart data.
 * Uses keystroke mistake totals for error progression to stay consistent
 * with final accuracy/error-rate metrics.
 */
export function generateWpmProgressionData(
  elapsed: number,
  totalTyped: number,
  totalMistakes: number,
  accuracy: number,
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];

  let previousEstimatedMistakes = 0;

  // Loop every second
  for (let second = 1; second <= elapsed; second++) {
    // Calculate progress ratio for this time point
    const progressRatio = second / elapsed;

    // Estimate character count at this point based on linear typing progress
    const estimatedTypedCount = Math.floor(totalTyped * progressRatio);

    // Skip if no characters typed yet
    if (estimatedTypedCount === 0) continue;

    // Estimate cumulative mistakes up to this second based on typing progress
    const estimatedCumulativeMistakes =
      totalTyped > 0
        ? Math.round((totalMistakes * estimatedTypedCount) / totalTyped)
        : 0;

    const errorsAtThisSecond = Math.max(
      0,
      estimatedCumulativeMistakes - previousEstimatedMistakes,
    );
    previousEstimatedMistakes = estimatedCumulativeMistakes;

    const minutesElapsed = second / 60;

    // Calculate metrics using CUMULATIVE data for WPM/accuracy
    const rawWpm = Math.round(estimatedTypedCount / 5 / minutesElapsed);

    const cumulativeErrorRate =
      estimatedTypedCount > 0
        ? Math.round((estimatedCumulativeMistakes / estimatedTypedCount) * 100)
        : 0;

    const cumulativeAccuracy =
      estimatedTypedCount > 0
        ? Math.round(
            ((estimatedTypedCount - estimatedCumulativeMistakes) /
              estimatedTypedCount) *
              100,
          )
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
  }

  // Ensure we always have the final data point
  if (data.length === 0 || data[data.length - 1].time !== elapsed) {
    const finalErrorRate =
      totalTyped > 0 ? Math.round((totalMistakes / totalTyped) * 100) : 0;

    const finalRawWpm = Math.round(totalTyped / 5 / (elapsed / 60));
    const finalAdjustedWpm = Math.round(
      (Math.round(accuracy) / 100) * finalRawWpm,
    );

    // Estimate mistakes in final second only
    const previousTyped = Math.floor(totalTyped * ((elapsed - 1) / elapsed));
    const previousMistakes =
      totalTyped > 0
        ? Math.round((totalMistakes * previousTyped) / totalTyped)
        : 0;
    const finalSecondErrors = Math.max(0, totalMistakes - previousMistakes);

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

export function computeResultsStats(
  input: ComputeResultsStatsInput,
): UnifiedResultsStats {
  const { elapsed, totalTyped, errors, correctChars, charStatus } = input;

  const normalizedAccuracy =
    totalTyped > 0 ? roundTo((correctChars / totalTyped) * 100, 0) : 0;
  const normalizedIncorrectChars = Math.max(0, totalTyped - correctChars);

  const baseStats = calculateResultStats(
    elapsed,
    totalTyped,
    errors,
    normalizedAccuracy,
    charStatus,
  );
  const statusCounts = countCharStatuses(charStatus);
  const wordMetrics = calculateWordMetrics(totalTyped, correctChars);
  const consistency = calculateConsistency(
    normalizedAccuracy,
    baseStats.errorRate,
  );
  const progression = generateWpmProgressionData(
    elapsed,
    totalTyped,
    errors,
    normalizedAccuracy,
  );

  return {
    netWpm: baseStats.adjustedWpm,
    grossWpm: baseStats.rawWpm,
    accuracy: normalizedAccuracy,
    errorRate: baseStats.errorRate,
    correctChars,
    incorrectChars: normalizedIncorrectChars,
    pendingChars: statusCounts.pending,
    wordsTyped: wordMetrics.wordsTyped,
    correctWords: wordMetrics.correctWords,
    timePerChar: baseStats.timePerChar,
    charsPerSecond: baseStats.charsPerSecond,
    consistency,
    keystrokesPerSecond: baseStats.charsPerSecond,
    performanceData: progression.map((point) => ({
      name: point.time,
      wpm: point.adjustedWpm,
      rawWpm: point.rawWpm,
      accuracy: point.accuracy,
      errorRate: point.errorRate,
      errorsAtThisSecond: point.errorsAtThisSecond,
    })),
  };
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

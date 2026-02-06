import { useMemo, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  calculateResultStats,
  generateWpmProgressionData,
  countCharStatuses,
  chartTooltipStyle,
} from "@utils/resultsCalculations";
import { Button } from "@components/ui/common";
import { useHistoryStats } from "@hooks/useHistoryStats";
import type { Language, Mode, TypingAttempt } from "@shared-types/index";

interface ResultsLocationState {
  results: {
    wpm: number;
    accuracy: number;
    errors: number;
    elapsed: number;
    totalTyped: number;
    correctChars: number;
    charStatus: Record<number, "pending" | "correct" | "incorrect">;
    targetText: string;
    mode: Mode;
    language: Language;
    isNewHighScore: boolean;
    isBaseline: boolean;
  };
  highScore: number;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state as ResultsLocationState;
  const { addAttempt, allAttempts } = useHistoryStats();

  // Check if we're viewing a historical attempt
  const attemptId = searchParams.get("attemptId");
  const historicalAttempt = useMemo(() => {
    if (attemptId) {
      return allAttempts.find((attempt) => attempt.id === attemptId) || null;
    }
    return null;
  }, [attemptId, allAttempts]);

  // Determine data source: either from location state (new test) or historical attempt
  const isHistoricalView = !!historicalAttempt;
  const resultsData = isHistoricalView
    ? {
        wpm: historicalAttempt.wpm,
        accuracy: historicalAttempt.accuracy,
        errors: historicalAttempt.errors,
        elapsed: historicalAttempt.elapsed,
        totalTyped: historicalAttempt.totalTyped,
        correctChars: historicalAttempt.correctChars,
        charStatus: {}, // Historical attempts don't have charStatus
        targetText: "",
        mode: historicalAttempt.mode,
        language: historicalAttempt.language,
        isNewHighScore: false,
        isBaseline: false,
      }
    : state?.results;

  const {
    wpm,
    accuracy,
    errors,
    elapsed,
    totalTyped,
    correctChars,
    charStatus,
    mode,
    language,
    isNewHighScore,
    isBaseline,
  } = resultsData || {
    wpm: 0,
    accuracy: 0,
    errors: 0,
    elapsed: 0,
    totalTyped: 0,
    correctChars: 0,
    charStatus: {},
    mode: "30s",
    language: "slang",
    isNewHighScore: false,
    isBaseline: false,
  };

  // Save attempt to history when component mounts (only for new tests, not historical views)
  useEffect(() => {
    if (state?.results && !isHistoricalView) {
      const attempt: TypingAttempt = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        wpm,
        accuracy: Math.round(accuracy),
        errors,
        elapsed,
        mode,
        language,
        totalTyped,
        correctChars,
      };
      addAttempt(attempt);
    }
  }, [
    state?.results,
    wpm,
    accuracy,
    errors,
    elapsed,
    mode,
    language,
    totalTyped,
    correctChars,
    addAttempt,
    isHistoricalView,
  ]);

  // Use utility functions to calculate stats
  const stats = useMemo(() => {
    return calculateResultStats(
      elapsed,
      totalTyped,
      correctChars,
      accuracy,
      charStatus,
    );
  }, [elapsed, totalTyped, correctChars, accuracy, charStatus]);

  // Generate chart data (only for new tests with charStatus data)
  const chartData = useMemo(() => {
    if (
      isHistoricalView ||
      !charStatus ||
      Object.keys(charStatus).length === 0
    ) {
      return [];
    }
    return generateWpmProgressionData(
      elapsed,
      totalTyped,
      correctChars,
      charStatus,
      accuracy,
    );
  }, [
    elapsed,
    totalTyped,
    correctChars,
    charStatus,
    accuracy,
    isHistoricalView,
  ]);

  // Count character statuses
  const statusCounts = useMemo(() => {
    return countCharStatuses(charStatus);
  }, [charStatus]);

  if (!resultsData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-foreground/70">No results to display</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground flex flex-col font-mono">
      <main className="px-8 sm:px-16 md:px-20 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => navigate(isHistoricalView ? "/history" : "/")}
              className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95 -ml-2"
              aria-label="back"
            >
              ←
            </button>
            <h2 className="text-lg sm:text-xl font-bold font-mono">
              {isHistoricalView ? "attempt_details" : "test_results"}
            </h2>
            {isBaseline && !isHistoricalView && (
              <div className="text-xs sm:text-sm font-mono text-green-400 ml-auto">
                baseline established!
              </div>
            )}
            {isNewHighScore && !isBaseline && !isHistoricalView && (
              <div className="text-xs sm:text-sm font-mono text-yellow-400 ml-auto animate-pulse">
                high score smashed! 🎯
              </div>
            )}
            {isHistoricalView && historicalAttempt && (
              <div className="text-xs sm:text-sm font-mono text-foreground/60 ml-auto">
                {new Date(historicalAttempt.timestamp).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => {
                navigate("/");
              }}
              variant="primary"
            >
              {isHistoricalView ? "try_again" : "try_again"}
            </Button>
          </div>

          {/* Key Stats - Focused View */}
          <div className="mb-6 p-4 border border-secondary/40 rounded bg-secondary/10">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <div className="text-xs text-foreground/60">adjusted wpm</div>
                <div className="text-2xl font-bold text-highlight">
                  {stats.adjustedWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">raw wpm</div>
                <div className="text-2xl font-bold text-secondary">
                  {stats.rawWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">accuracy</div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.accuracy}%
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">duration</div>
                <div className="text-2xl font-bold text-foreground">
                  {elapsed}s
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">error rate</div>
                <div className="text-2xl font-bold text-red-400">
                  {stats.errorRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart - Only show for new tests with chart data */}
          {chartData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                performance_analysis
              </h3>
              <div className="border border-secondary/30 rounded p-2 bg-secondary/5">
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgb(75, 85, 99)"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="rgb(107, 114, 128)"
                      style={{ fontSize: "11px" }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="rgb(107, 114, 128)"
                      style={{ fontSize: "11px" }}
                      label={{
                        value: "WPM",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="rgb(107, 114, 128)"
                      style={{ fontSize: "11px" }}
                      label={{
                        value: "Err/Acc %",
                        angle: 90,
                        position: "insideRight",
                        offset: 10,
                      }}
                    />
                    <Tooltip {...chartTooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="adjustedWpm"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Adjusted WPM"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="rawWpm"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                      name="Raw WPM"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="errorRate"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      dot={false}
                      name="Error %"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#ffff00"
                      strokeWidth={1.5}
                      dot={false}
                      name="Accuracy %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Statistics Grid */}
          <div className="bg-background/40 border border-secondary/40 rounded p-4">
            <h3 className="text-xs font-mono text-foreground/70 mb-4 tracking-wider uppercase">
              detailed_statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  total typed
                </div>
                <div className="text-2xl font-bold text-highlight">
                  {totalTyped}
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  correct
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {statusCounts.correct}
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  incorrect
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {statusCounts.incorrect}
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  untyped
                </div>
                <div className="text-2xl font-bold text-foreground/50">
                  {statusCounts.pending}
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  error rate
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {stats.errorRate}%
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  time/char
                </div>
                <div className="text-2xl font-bold text-foreground/70">
                  {stats.timePerChar}s
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  chars/sec
                </div>
                <div className="text-2xl font-bold text-foreground/70">
                  {stats.charsPerSecond}
                </div>
              </div>
              <div className="p-3 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-wider font-light mb-2">
                  consistency
                </div>
                <div className="text-2xl font-bold text-foreground/70">
                  {(100 - parseFloat(stats.errorRate)).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

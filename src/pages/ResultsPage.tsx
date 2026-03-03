import { useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import {
  calculateResultStats,
  generateWpmProgressionData,
  countCharStatuses,
} from "@utils/resultsCalculations";
import { Button } from "@components/ui/common";
import useLocalStorage from "@hooks/useLocalStorage";
import type { Language, Mode, TypingAttempt } from "@shared-types/index";
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ResultsLocationState {
  results: {
    id: string;
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

function CombinedPerformanceChart({
  data,
}: {
  data: { name: number; wpm: number; accuracy: number; errorRate: number }[];
}) {
  return (
    <div>
      <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
        performance
      </h2>
      <div className="border border-secondary/35 rounded-xl p-3 bg-secondary/8">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(75, 85, 99)"
                opacity={0.25}
              />
              <XAxis
                dataKey="name"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
                tickMargin={6}
              />
              <YAxis
                yAxisId="left"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
                tickMargin={6}
                label={{ value: "WPM", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
                domain={[0, 100]}
                tickMargin={6}
                label={{
                  value: "Acc/Err %",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  borderRadius: "10px",
                  color: "var(--color-foreground)",
                  fontSize: "11px",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                  padding: "8px 10px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
                itemStyle={{ color: "var(--color-foreground)" }}
                cursor={{ stroke: "var(--color-highlight)", strokeOpacity: 0.4 }}
              />
              <Scatter
                yAxisId="right"
                type="monotone"
                dataKey="errorRate"
                fill="#ef4444"
                name="Errors"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wpm"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 3 }}
                name="Adjusted WPM"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 3 }}
                name="Accuracy %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
            no data
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsLocationState;
  const [, setAttempts] = useLocalStorage<TypingAttempt[]>(
    "slangtype_attempts",
    [],
  );
  const hasSavedAttemptRef = useRef(false);

  const {
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
  } = state?.results || {
    id: "",
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

  const performanceData = useMemo(
    () =>
      chartData.map((point, idx) => ({
        name: idx + 1,
        wpm: point.adjustedWpm,
        accuracy: point.accuracy,
        errorRate: point.errorRate,
      })),
    [chartData],
  );

  const statusCounts = useMemo(
    () => countCharStatuses(charStatus),
    [charStatus],
  );
  const wordsTyped = Math.round(totalTyped / 5);
  const correctWords = Math.round(statusCounts.correct / 5);
  const netWpm = stats.adjustedWpm;
  const grossWpm = stats.rawWpm;

  useEffect(() => {
    if (!state?.results || hasSavedAttemptRef.current) return;
    hasSavedAttemptRef.current = true;

    const attempt: TypingAttempt = {
      id: state.results.id,
      timestamp: Number(state.results.id.split("-")[0]) || Date.now(),
      wpm: stats.adjustedWpm,
      accuracy: Math.round(accuracy),
      errors,
      elapsed,
      mode,
      language,
      totalTyped,
      correctChars,
    };

    setAttempts((prev) => {
      if (prev.some((existing) => existing.id === attempt.id)) return prev;
      return [...prev, attempt];
    });
  }, [
    state,
    setAttempts,
    stats.adjustedWpm,
    accuracy,
    errors,
    elapsed,
    mode,
    language,
    totalTyped,
    correctChars,
  ]);

  if (!state || !state.results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-foreground/70">No results to display</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground flex flex-col font-mono">
      <main className="px-6 sm:px-10 md:px-12 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2 shrink-0"
              aria-label="back"
              title="back to typing"
            >
              <TbArrowLeft size={24} className="text-inherit" />
            </button>
            <div className="flex-1 -ml-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-wider leading-tight">
                results
              </h2>
              <p className="text-xs text-foreground/60 mt-1 leading-tight">
                {language} / {mode} • {elapsed}s
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isBaseline && (
                <div className="text-xs sm:text-sm text-green-400">
                  baseline established
                </div>
              )}
              {isNewHighScore && !isBaseline && (
                <div className="text-xs sm:text-sm text-yellow-400">
                  new high score
                </div>
              )}
              <Button onClick={() => navigate("/")} variant="primary">
                try again
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
            <div className="flex flex-col h-full">
              <div className="p-5 bg-highlight/10 rounded-xl flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className="text-sm text-foreground/60">wpm</div>
                    <div className="text-5xl font-extrabold text-highlight leading-none">
                      {netWpm}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">accuracy</div>
                    <div className="text-5xl font-extrabold text-foreground px-2 py-1 inline-block leading-none">
                      {stats.accuracy}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-foreground/60 mt-4 space-y-1">
                  <div>
                    raw wpm: <span className="text-foreground">{grossWpm}</span>
                  </div>
                  <div>
                    error rate:{" "}
                    <span className="text-foreground">
                      {Number(stats.errorRate).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    duration: <span className="text-foreground">{elapsed}s</span>
                  </div>
                </div>
              </div>
            </div>
            <CombinedPerformanceChart data={performanceData} />
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">errors</div>
              <div className="text-2xl font-bold text-foreground">
                {statusCounts.incorrect}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">
                {Number(stats.errorRate).toFixed(1)}% rate
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">time / char</div>
              <div className="text-2xl font-bold text-foreground">
                {stats.timePerChar}s
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">chars / sec</div>
              <div className="text-2xl font-bold text-foreground">
                {stats.charsPerSecond}
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">consistency</div>
              <div className="text-2xl font-bold text-foreground">
                {(100 - parseFloat(stats.errorRate)).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">correct words</div>
              <div className="text-2xl font-bold text-foreground">
                {correctWords}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">
                {statusCounts.correct} chars
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">untyped</div>
              <div className="text-2xl font-bold text-foreground">
                {statusCounts.pending}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">chars</div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
              <div className="text-xs text-foreground/60">words typed</div>
              <div className="text-2xl font-bold text-foreground">
                {wordsTyped}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">words</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

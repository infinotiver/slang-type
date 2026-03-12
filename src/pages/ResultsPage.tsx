import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { useResultsStats } from "@hooks/useResultsStats";
import { Button } from "@components/ui/common";
import useLocalStorage from "@hooks/useLocalStorage";
import type { Language, Mode, TypingAttempt } from "@shared-types/index";
import {
  ComposedChart,
  Line,
  Scatter,
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

interface ChartPayload {
  dataKey: string;
  name: string;
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: ChartPayload[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    const colors: Record<string, string> = {
      wpm: "#10b981",
      accuracy: "#f59e0b",
      errorsAtThisSecond: "rgb(239, 68, 68)",
    };
    const labels: Record<string, string> = {
      wpm: "Adjusted WPM",
      accuracy: "Accuracy",
      errorsAtThisSecond: "Errors",
    };

    const filtered = payload.filter((entry) => labels[entry.dataKey]);

    return (
      <div className="bg-secondary border border-secondary/30 rounded-lg p-2 text-[11px] space-y-1">
        <div className="text-foreground/70">{`s ${label}`}</div>
        {filtered.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors[entry.dataKey] }}
            />
            <span className="text-foreground">{`${labels[entry.dataKey]}: ${entry.value}`}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CombinedPerformanceChart({
  data,
}: {
  data: Array<{
    name: number;
    wpm: number;
    accuracy: number;
    errorRate: number;
  }>;
}) {
  return (
    <div>
      <div className="border border-secondary/35 rounded-xl p-3 bg-secondary/8">
        {data.length > 0 ? (
          <ResponsiveContainer height={200}>
            <ComposedChart data={data} responsive={true}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(75, 85, 99)"
                opacity={0.25}
              />
              <XAxis
                dataKey="name"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
              />
              <YAxis
                yAxisId="left"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
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
              <Tooltip content={<CustomTooltip />} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wpm"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                name="Adjusted WPM"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Scatter
                yAxisId="right"
                dataKey="errorsAtThisSecond"
                fill="rgb(239, 68, 68)"
                isAnimationActive={false}
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

  const stats = useResultsStats({
    elapsed,
    totalTyped,
    correctChars,
    accuracy,
    charStatus,
  });

  const netWpm = stats.netWpm;
  const grossWpm = stats.grossWpm;

  useEffect(() => {
    if (!state?.results || hasSavedAttemptRef.current) return;
    hasSavedAttemptRef.current = true;

    const attempt: TypingAttempt = {
      id: state.results.id,
      timestamp: Number(state.results.id.split("-")[0]) || Date.now(),
      wpm: stats.netWpm,
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
    stats.netWpm,
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
      <main className="py-1">
        <div className="w-full">
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
                <div className="text-xs sm:text-sm text-foreground/70">
                  baseline established
                </div>
              )}
              {isNewHighScore && !isBaseline && (
                <div className="text-xs sm:text-sm text-foreground/70">
                  new high score
                </div>
              )}
              <Button onClick={() => navigate("/")} variant="primary">
                try again
              </Button>
            </div>
          </div>

          <div className="flex gap-6 flex-1">
            <div className="lg:w-[200px] flex flex-col gap-6 shrink-0">
              <div className="p-4 bg-highlight/10 rounded-xl flex flex-col justify-between min-h-[220px]">
                {/* Upper Stats */}
                <div className="space-y-4">
                  <section>
                    <div className="text-sm text-foreground/60">wpm</div>
                    <div className="text-5xl font-extrabold text-highlight leading-none">
                      {netWpm}
                    </div>
                  </section>

                  <section>
                    <div className="text-sm text-foreground/60">accuracy</div>
                    <div className="text-5xl font-extrabold text-foreground leading-none">
                      {stats.accuracy}%
                    </div>
                  </section>
                </div>

                {/* Lower Metadata */}
                <div className="text-xs text-foreground/60">
                  raw wpm: <span className="text-foreground">{grossWpm}</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <CombinedPerformanceChart data={stats.performanceData} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">errors</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.incorrectChars}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">
                {Number(stats.errorRate).toFixed(1)}% rate
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">time / char</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.timePerChar}s
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">chars / sec</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.charsPerSecond}
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">consistency</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.consistency.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">correct words</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.correctWords}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">
                {stats.correctChars} chars
              </div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">untyped</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.pendingChars}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">chars</div>
            </div>
            <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
              <div className="text-xs text-foreground/60">words typed</div>
              <div className="text-2xl font-bold text-foreground mt-auto">
                {stats.wordsTyped}
              </div>
              <div className="text-[11px] text-foreground/50 mt-1">words</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

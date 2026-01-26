import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useLocalStorage from "../../hooks/useLocalStorage";
import type { TypingAttempt } from "../../types";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [attempts] = useLocalStorage<TypingAttempt[]>("slangtype_attempts", []);
  const [selectedAttempt, setSelectedAttempt] = useState<TypingAttempt | null>(
    null,
  );

  const stats = {
    totalAttempts: attempts.length,
    totalCharsTyped: attempts.reduce((sum, a) => sum + a.totalTyped, 0),
    bestWpm: attempts.length > 0 ? Math.max(...attempts.map((a) => a.wpm)) : 0,
    avgWpm:
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.wpm, 0) / attempts.length,
          )
        : 0,
    bestAccuracy:
      attempts.length > 0 ? Math.max(...attempts.map((a) => a.accuracy)) : 0,
    avgAccuracy:
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length,
          )
        : 0,
    totalTime: attempts.reduce((sum, a) => sum + a.elapsed, 0),
  };

  // Best stats by language
  const statsByLanguage = {
    slang: attempts
      .filter((a) => a.language === "slang")
      .reduce(
        (best, a) => (!best || a.wpm > best.wpm ? a : best),
        null as TypingAttempt | null,
      ),
    english: attempts
      .filter((a) => a.language === "english")
      .reduce(
        (best, a) => (!best || a.wpm > best.wpm ? a : best),
        null as TypingAttempt | null,
      ),
    code: attempts
      .filter((a) => a.language === "code")
      .reduce(
        (best, a) => (!best || a.wpm > best.wpm ? a : best),
        null as TypingAttempt | null,
      ),
  };

  // Best stats by mode (timed duration)
  const statsByMode: Record<string, TypingAttempt | null> = {};
  attempts.forEach((a) => {
    const mode = a.mode;
    if (!statsByMode[mode] || a.wpm > statsByMode[mode]!.wpm) {
      statsByMode[mode] = a;
    }
  });

  const allAttempts = [...attempts].reverse();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };
  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      slang: "slang",
      english: "english",
      code: "code",
    };
    return labels[lang] || lang;
  };

  // Chart data: WPM progression over attempts
  const wpmProgressionData = useMemo(() => {
    return allAttempts.map((attempt, idx) => ({
      name: idx + 1,
      wpm: attempt.wpm,
      accuracy: Math.round(attempt.accuracy),
    }));
  }, [allAttempts]);

  // Show detail view for selected attempt
  if (selectedAttempt) {
    const minutesElapsed = selectedAttempt.elapsed / 60;
    const adjustedWpm =
      selectedAttempt.correctChars > 0
        ? Math.round(selectedAttempt.correctChars / 5 / minutesElapsed)
        : 0;
    const rawWpm =
      selectedAttempt.totalTyped > 0
        ? Math.round(selectedAttempt.totalTyped / 5 / minutesElapsed)
        : 0;

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
        {/* Detail Header */}
        <header className="px-8 sm:px-16 md:px-20 py-6 sm:py-8 border-b border-secondary/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAttempt(null)}
              className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95 -ml-2"
              aria-label="back"
              title="back to history"
            >
              <TbArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wider">
                attempt details
              </h1>
              <p className="text-xs text-foreground/60 mt-1">
                {formatDate(selectedAttempt.timestamp)}
              </p>
            </div>
          </div>
        </header>

        {/* Detail Content */}
        <main className="flex-1 px-8 sm:px-16 md:px-20 py-10 flex items-center justify-center">
          <div className="max-w-2xl w-full px-4 sm:px-6 md:px-8">
            {/* Test Info */}
            <div className="mb-8 pb-8 border-b border-secondary/40">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    test type
                  </div>
                  <div className="text-sm font-mono">
                    {getLanguageLabel(selectedAttempt.language)} /{" "}
                    {selectedAttempt.mode}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    duration
                  </div>
                  <div className="text-sm font-mono">
                    {selectedAttempt.elapsed}s
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mb-8">
              <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
                performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    adjusted wpm
                  </div>
                  <div className="text-2xl font-bold text-highlight">
                    {adjustedWpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    raw wpm
                  </div>
                  <div className="text-2xl font-bold text-secondary">
                    {rawWpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    accuracy
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(selectedAttempt.accuracy)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    time elapsed
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {selectedAttempt.elapsed}s
                  </div>
                </div>
              </div>
            </div>

            {/* Character Stats */}
            <div className="mb-8">
              <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
                character stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    total typed
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedAttempt.totalTyped}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    correct
                  </div>
                  <div className="text-lg font-semibold text-highlight">
                    {selectedAttempt.correctChars}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    errors
                  </div>
                  <div className="text-lg font-semibold text-red-500">
                    {selectedAttempt.errors}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    error rate
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedAttempt.totalTyped > 0
                      ? (
                          ((selectedAttempt.totalTyped -
                            selectedAttempt.correctChars) /
                            selectedAttempt.totalTyped) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main history list view
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
      {/* Header */}
      <header className="px-8 sm:px-16 md:px-20 py-6 sm:py-8 border-b border-secondary/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95 -ml-2"
            aria-label="back"
            title="back to typing"
          >
            <TbArrowLeft size={24} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-wider">
            history
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-8 sm:px-16 md:px-20 py-10">
        {attempts.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Key Stats - Focused View */}
            <div className="mb-6 p-4 border border-secondary/40 rounded bg-secondary/10">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <div className="text-xs text-foreground/60">best wpm</div>
                  <div className="text-2xl font-bold text-highlight">
                    {stats.bestWpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">avg wpm</div>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.avgWpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">best acc</div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(stats.bestAccuracy)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">total time</div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatTime(stats.totalTime)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">attempts</div>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalAttempts}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WPM Progression */}
              <div>
                <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                  wpm progression
                </h2>
                <div className="border border-secondary/30 rounded p-2 bg-secondary/5">
                  {wpmProgressionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={wpmProgressionData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgb(75, 85, 99)"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="rgb(107, 114, 128)"
                          style={{ fontSize: "11px" }}
                        />
                        <YAxis
                          stroke="rgb(107, 114, 128)"
                          style={{ fontSize: "11px" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgb(31, 41, 55)",
                            border: "1px solid rgb(75, 85, 99)",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="wpm"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
                      no data
                    </div>
                  )}
                </div>
              </div>

              {/* Accuracy Trend */}
              <div>
                <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                  accuracy trend
                </h2>
                <div className="border border-secondary/30 rounded p-2 bg-secondary/5">
                  {wpmProgressionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={wpmProgressionData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgb(75, 85, 99)"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="rgb(107, 114, 128)"
                          style={{ fontSize: "11px" }}
                        />
                        <YAxis
                          stroke="rgb(107, 114, 128)"
                          style={{ fontSize: "11px" }}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgb(31, 41, 55)",
                            border: "1px solid rgb(75, 85, 99)",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
                      no data
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown by Language & Mode - Grid Cards */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Language - Grid Cards */}
              <div>
                <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                  by language
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(statsByLanguage).map(([lang, attempt]) => (
                    <div
                      key={lang}
                      className="p-3 border border-secondary/30 rounded bg-secondary/5 hover:bg-secondary/10 hover:border-highlight transition-colors"
                    >
                      <div className="text-xs font-semibold text-foreground/70 mb-2 capitalize">
                        {getLanguageLabel(lang)}
                      </div>
                      {attempt ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-foreground/50 text-xs">
                              wpm
                            </span>
                            <span className="text-lg font-bold text-highlight">
                              {attempt.wpm}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-foreground/50 text-xs">
                              acc
                            </span>
                            <span className="text-sm font-semibold">
                              {Math.round(attempt.accuracy)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-foreground/30 text-xs">
                          no attempts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* By Mode - Grid Cards */}
              <div>
                <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                  by mode
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(statsByMode)
                    .sort(([modeA], [modeB]) => {
                      const orderMap: Record<string, number> = {
                        "15s": 0,
                        "30s": 1,
                        "60s": 2,
                        "120s": 3,
                      };
                      return (
                        (orderMap[modeA] ?? 999) - (orderMap[modeB] ?? 999)
                      );
                    })
                    .map(([mode, attempt]) => (
                      <div
                        key={mode}
                        className="p-3 border border-secondary/30 rounded bg-secondary/5 hover:bg-secondary/10 hover:border-highlight transition-colors"
                      >
                        <div className="text-xs font-semibold text-foreground/70 mb-2">
                          {mode}
                        </div>
                        {attempt ? (
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-foreground/50 text-xs">
                                wpm
                              </span>
                              <span className="text-lg font-bold text-highlight">
                                {attempt.wpm}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-foreground/50 text-xs">
                                acc
                              </span>
                              <span className="text-sm font-semibold">
                                {Math.round(attempt.accuracy)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-foreground/30 text-xs">
                            no attempts
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* All Attempts */}
            <div>
              <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
                attempts ({allAttempts.length})
              </h2>
              <div className="space-y-0.5">
                {allAttempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => setSelectedAttempt(attempt)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-secondary/15 rounded border border-secondary/30 hover:border-highlight hover:bg-secondary/25 transition-colors text-left text-xs font-mono"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground/70">
                        {formatDate(attempt.timestamp)}
                      </div>
                      <div className="text-foreground/50 text-xs">
                        {getLanguageLabel(attempt.language)} • {attempt.mode}
                      </div>
                    </div>
                    <div className="flex gap-4 ml-4 text-right whitespace-nowrap">
                      <div>
                        <span className="text-foreground/50">wpm </span>
                        <span className="text-highlight font-semibold">
                          {attempt.wpm}
                        </span>
                      </div>
                      <div>
                        <span className="text-foreground/50">acc </span>
                        <span className="font-semibold">
                          {Math.round(attempt.accuracy)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-sm text-foreground/70 text-center">
              no attempts yet. start typing to build your history!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

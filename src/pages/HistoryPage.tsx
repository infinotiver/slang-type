import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { useHistoryStats } from "@hooks/useHistoryStats";
import { HistoryStatCard, StatBreakdownCard } from "@components/ui/stats";
import { ChartContainer } from "@components/ui/charts";
import { AttemptListItem } from "@components/ui/lists";
import type { TypingAttempt } from "@shared-types/index";
import { Button } from "@components/ui/common";
export default function HistoryPage() {
  const navigate = useNavigate();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );

  const {
    attempts,
    allAttempts,
    stats,
    statsByLanguage,
    statsByMode,
    wpmProgressionData,
  } = useHistoryStats();

  // Derive selectedAttempt from attemptId
  const selectedAttempt = useMemo(
    () =>
      selectedAttemptId
        ? allAttempts.find((a) => a.id === selectedAttemptId) || null
        : null,
    [selectedAttemptId, allAttempts],
  );

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

  const handleAttemptSelect = (attempt: TypingAttempt) => {
    setSelectedAttemptId(attempt.id);
  };

  // Show detail view for selected attempt
  if (selectedAttempt) {
    const minutesElapsed = selectedAttempt.elapsed / 60;
    const rawWpm =
      selectedAttempt.totalTyped > 0
        ? Math.round(selectedAttempt.totalTyped / 5 / minutesElapsed)
        : 0;
    const adjustedWpm = Math.round(
      (Math.round(selectedAttempt.accuracy) / 100) * rawWpm,
    );

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
        {/* Detail Header */}
        <header className="px-8 sm:px-16 md:px-20 py-6 sm:py-8 border-b border-secondary/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAttemptId(null)}
              className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2"
              aria-label="back"
              title="back to history"
            >
              <TbArrowLeft size={24} className="text-inherit" />
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
        <main className="flex-1 px-8 sm:px-16 md:px-20 py-8 sm:py-10 flex items-center justify-center">
          <div className="max-w-2xl w-full px-4 sm:px-6 md:px-8">
            {/* Test Info */}
            <div className="mb-6 pb-6 border-b border-secondary/35">
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
            <div className="mb-6">
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
            <div className="mb-6">
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

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/")}
                className="px-6 py-2"
              >
                try again
              </Button>
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
            className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2"
            aria-label="back"
            title="back to typing"
          >
            <TbArrowLeft size={24} className="text-inherit" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-wider">
            history
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-8 sm:px-16 md:px-20 py-8 sm:py-10">
        {attempts.length > 0 ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Key Stats - Focused View */}
            <div className="mb-6 p-4 border border-secondary/35 rounded-xl bg-secondary/8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <HistoryStatCard
                  label="best wpm"
                  value={stats.bestWpm}
                  highlight
                />
                <HistoryStatCard label="avg wpm" value={stats.avgWpm} />
                <HistoryStatCard
                  label="best acc"
                  value={`${Math.round(stats.bestAccuracy)}%`}
                />
                <HistoryStatCard
                  label="total time"
                  value={formatTime(stats.totalTime)}
                />
                <HistoryStatCard label="attempts" value={stats.totalAttempts} />
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="wpm progression"
                data={wpmProgressionData}
                dataKey="wpm"
                stroke="#10b981"
              />
              <ChartContainer
                title="accuracy trend"
                data={wpmProgressionData}
                dataKey="accuracy"
                stroke="#f59e0b"
                yAxisDomain={[0, 100]}
              />
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
                    <StatBreakdownCard
                      key={lang}
                      label={getLanguageLabel(lang)}
                      attempt={attempt}
                    />
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
                      <StatBreakdownCard
                        key={mode}
                        label={mode}
                        attempt={attempt}
                      />
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
                  <AttemptListItem
                    key={attempt.id}
                    attempt={attempt}
                    formatDate={formatDate}
                    getLanguageLabel={getLanguageLabel}
                    onSelect={handleAttemptSelect}
                  />
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

import { useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { useHistoryStats } from "@hooks/useHistoryStats";
import { HistoryStatCard, StatBreakdownCard } from "@components/ui/stats";
import { ChartContainer } from "@components/ui/charts";
import { AttemptListItem } from "@components/ui/lists";
import type { TypingAttempt } from "@shared-types/index";

export default function HistoryPage() {
  const navigate = useNavigate();

  const {
    attempts,
    allAttempts,
    stats,
    statsByLanguage,
    statsByMode,
    wpmProgressionData,
  } = useHistoryStats();

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
    navigate(`/results?attemptId=${attempt.id}`);
  };

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

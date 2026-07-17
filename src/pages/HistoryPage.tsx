import { useNavigate } from "react-router-dom";
import { useHistoryStats } from "@hooks/useHistoryStats";
import { ChartContainer } from "@components/ui/charts";
import { AttemptListItem } from "@components/ui/lists";
import type { TypingAttempt } from "@shared-types/index";
import { TopBar } from "@components/ui/common";
import BestResultCard from "@/components/ui/stats/BestResultCard";
import { formatDate, formatDuration } from "@/utils/timeFormat";
import SummaryStatCard from "@/components/ui/stats/SummaryStatCard";
import { useMemo } from "react";
const LANGUAGE_LABELS: Record<string, string> = {
  slang: "slang",
  english: "english",
  code: "code",
};

const MODE_ORDER: Record<string, number> = {
  "15s": 0,
  "30s": 1,
  "60s": 2,
  "120s": 3,
};

function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang] || lang;
}

function HistoryOverview({
  stats,
  statsByLanguage,
  statsByMode,
  wpmProgressionData,
  allAttempts,
}: {
  stats: ReturnType<typeof useHistoryStats>["stats"];
  statsByLanguage: ReturnType<typeof useHistoryStats>["statsByLanguage"];
  statsByMode: ReturnType<typeof useHistoryStats>["statsByMode"];
  wpmProgressionData: ReturnType<typeof useHistoryStats>["wpmProgressionData"];
  allAttempts: TypingAttempt[];
}) {
  const sortedModes = Object.entries(statsByMode).sort(
    ([a], [b]) => (MODE_ORDER[a] ?? 999) - (MODE_ORDER[b] ?? 999),
  );

  return (
    <>
      <div className="mb-6 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
          <div className="contents lg:flex lg:w-full lg:gap-2">
            <SummaryStatCard label="best wpm" value={stats.bestWpm} highlight />

            <SummaryStatCard
              label="best acc"
              value={`${Math.round(stats.bestAccuracy)}%`}
              highlight
            />
          </div>

          <SummaryStatCard label="avg wpm" value={stats.avgWpm} />

          <SummaryStatCard
            label="avg accuracy"
            value={`${stats.avgAccuracy}%`}
          />

          <SummaryStatCard
            label="total time"
            value={formatDuration(stats.totalTime)}
          />

          <SummaryStatCard label="attempts" value={stats.totalAttempts} />

          <SummaryStatCard label="correct chars" value={stats.totalCorrect} />
        </div>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <ChartContainer
            title="wpm progression"
            data={wpmProgressionData}
            dataKey="wpm"
            stroke="#10b981"
          />
        </div>
        <div className="flex-1 min-w-0">
          <ChartContainer
            title="accuracy trend"
            data={wpmProgressionData}
            dataKey="accuracy"
            stroke="#f59e0b"
            yAxisDomain={[0, 100]}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-mono text-foreground mb-2 tracking-wider uppercase">
            by language
          </h2>
          <div className="flex flex-col flex-wrap gap-2">
            {Object.entries(statsByLanguage)
              .filter(([, attempt]) => attempt !== null)
              .map(([lang, attempt]) => (
                <div key={lang} className="flex-1 min-w-36">
                  <BestResultCard
                    label={getLanguageLabel(lang)}
                    attempt={attempt!}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-mono text-foreground mb-2 tracking-wider uppercase">
            by mode
          </h2>
          <div className="flex flex-col flex-wrap gap-2">
            {sortedModes.map(([mode, attempt]) => (
              <div key={mode} className="flex-1 min-w-36">
                <BestResultCard label={mode} attempt={attempt} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All attempts */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-mono text-foreground tracking-wider uppercase">
          attempts ({allAttempts.length})
        </h2>
        <div className="flex flex-col gap-0.5">
          {allAttempts.map((attempt) => (
            <AttemptListItem
              key={attempt.id}
              attempt={attempt}
              formatDate={formatDate}
              getLanguageLabel={getLanguageLabel}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();

  const { attempts, stats, statsByLanguage, statsByMode, wpmProgressionData } =
    useHistoryStats();

  const attemptsForList = useMemo(() => [...attempts].reverse(), [attempts]);

  return (
    <div className="bg-background text-foreground flex-1 h-full min-h-0 flex flex-col font-mono">
      <TopBar title="history" onBack={() => navigate("/")} />

      <main className="flex-1 min-h-0 overflow-y-auto py-6 sm:py-7 px-4 sm:px-6">
        {attempts.length > 0 ? (
          <HistoryOverview
            stats={stats}
            statsByLanguage={statsByLanguage}
            statsByMode={statsByMode}
            wpmProgressionData={wpmProgressionData}
            allAttempts={attemptsForList}
          />
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-sm text-foreground text-center">
              no attempts yet. start typing to build your history!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

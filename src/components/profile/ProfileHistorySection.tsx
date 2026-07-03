import {
  StatCard as SummaryStatCard,
  ResultCard as BestResultCard,
} from "@components/ui/stats";
import { ChartContainer } from "@components/ui/charts";
import { AttemptListItem } from "@components/ui/lists";
import type { TypingAttempt } from "@shared-types/index";
import type {
  HistoryStats,
  StatsByLanguage,
  WpmProgressionPoint,
} from "@utils/historyStats";
import { formatDate, getLanguageLabel, MODE_ORDER } from "./utils";
import { formatPercent } from "@/utils/numberFormat";
import { formatDuration } from "@/utils/timeFormat";

interface ProfileHistorySectionProps {
  attempts: TypingAttempt[];
  stats: HistoryStats;
  statsByLanguage: StatsByLanguage;
  statsByMode: Record<string, TypingAttempt | null>;
  wpmProgressionData: WpmProgressionPoint[];
  onSelectAttempt: (id: string) => void;
}

export default function ProfileHistorySection({
  attempts,
  stats,
  statsByLanguage,
  statsByMode,
  wpmProgressionData,
  onSelectAttempt,
}: ProfileHistorySectionProps) {
  if (attempts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <p className="text-sm text-foreground text-center">
          no attempts yet — start typing to build your history!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 border border-secondary/35 rounded-full bg-secondary/8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <SummaryStatCard label="best wpm" value={stats.bestWpm} highlight />
          <SummaryStatCard label="avg wpm" value={stats.avgWpm} />
          <SummaryStatCard
            label="best acc"
            value={formatPercent(stats.bestAccuracy)}
          />
          <SummaryStatCard
            label="total time"
            value={formatDuration(stats.totalTime)}
          />
          <SummaryStatCard label="attempts" value={stats.totalAttempts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-mono text-foreground mb-2 tracking-wider uppercase">
            by language
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(statsByLanguage).map(([language, attempt]) => (
              <BestResultCard
                key={language}
                label={getLanguageLabel(language)}
                attempt={attempt}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-mono text-foreground mb-2 tracking-wider uppercase">
            by mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(statsByMode)
              .sort(([a], [b]) => (MODE_ORDER[a] ?? 99) - (MODE_ORDER[b] ?? 99))
              .map(([mode, attempt]) => (
                <BestResultCard key={mode} label={mode} attempt={attempt} />
              ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-mono text-foreground mb-2 tracking-wider uppercase">
          attempts: ({attempts.length})
        </h2>
        <div className="space-y-0.5">
          {attempts.map((attempt) => (
            <AttemptListItem
              key={attempt.id}
              attempt={attempt}
              formatDate={formatDate}
              getLanguageLabel={getLanguageLabel}
              onSelect={(selected) => onSelectAttempt(selected.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

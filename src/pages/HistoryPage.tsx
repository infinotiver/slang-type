import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryStats } from "@hooks/useHistoryStats";
import { ChartContainer } from "@components/ui/charts";
import { AttemptListItem } from "@components/ui/lists";
import type { TypingAttempt } from "@shared-types/index";
import { Button, TopBar } from "@components/ui/common";
import BestResultCard from "@/components/ui/stats/BestResultCard";
import { formatDate, formatDuration } from "@/utils/timeFormat";
import SummaryStatCard from "@/components/ui/stats/SummaryStatCard";
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

function Stat({
  label,
  value,
  tone = "default",
  size = "lg",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "highlight" | "secondary" | "error";
  size?: "sm" | "lg";
}) {
  const toneClass = {
    default: "text-foreground",
    highlight: "text-highlight",
    secondary: "text-secondary",
    error: "text-red-500",
  }[tone];

  return (
    <div className="flex flex-col gap-1 min-w-28 flex-1">
      <span className="text-xs font-light tracking-wider text-foreground/70">
        {label}
      </span>
      <span
        className={`font-bold ${toneClass} ${size === "lg" ? "text-2xl" : "text-lg"}`}
      >
        {value}
      </span>
    </div>
  );
}

/** Rounded panel shared by every stat group on the page. */
function StatPanel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-secondary bg-secondary/10 p-5">
      {title && (
        <h3 className="text-sm font-mono text-foreground mb-4 tracking-wider">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-x-8 gap-y-5">{children}</div>
    </div>
  );
}

function AttemptDetail({
  attempt,
  onBack,
  onRetry,
}: {
  attempt: TypingAttempt;
  onBack: () => void;
  onRetry: () => void;
}) {
  const minutesElapsed = attempt.elapsed / 60;
  const rawWpm =
    attempt.totalTyped > 0
      ? Math.round(attempt.totalTyped / 5 / minutesElapsed)
      : 0;
  const adjustedWpm = Math.round((Math.round(attempt.accuracy) / 100) * rawWpm);
  const errorRate =
    attempt.totalTyped > 0
      ? (
          ((attempt.totalTyped - attempt.correctChars) / attempt.totalTyped) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="bg-background text-foreground flex-1 h-full min-h-0 flex flex-col font-mono">
      <TopBar title="attempt details" onBack={onBack} />
      <div className="py-2 px-4 sm:px-6 text-xs text-foreground mt-1">
        {formatDate(attempt.timestamp)}
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto py-4 sm:py-6 px-4 sm:px-6">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
          <StatPanel>
            <Stat
              label="test type"
              size="sm"
              value={`${getLanguageLabel(attempt.language)} / ${attempt.mode}`}
            />
            <Stat label="duration" size="sm" value={`${attempt.elapsed}s`} />
          </StatPanel>

          <StatPanel title="performance">
            <Stat label="adjusted wpm" tone="highlight" value={adjustedWpm} />
            <Stat label="raw wpm" tone="secondary" value={rawWpm} />
            <Stat label="accuracy" value={`${Math.round(attempt.accuracy)}%`} />
            <Stat label="time elapsed" value={`${attempt.elapsed}s`} />
          </StatPanel>

          <StatPanel title="character stats">
            <Stat label="total typed" size="sm" value={attempt.totalTyped} />
            <Stat
              label="correct"
              size="sm"
              tone="highlight"
              value={attempt.correctChars}
            />
            <Stat
              label="errors"
              size="sm"
              tone="error"
              value={attempt.errors}
            />
            <Stat label="error rate" size="sm" value={`${errorRate}%`} />
          </StatPanel>

          <div className="flex justify-center pt-2">
            <Button onClick={onRetry} className="px-6 py-2">
              try again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function HistoryOverview({
  stats,
  statsByLanguage,
  statsByMode,
  wpmProgressionData,
  allAttempts,
  onSelectAttempt,
}: {
  stats: ReturnType<typeof useHistoryStats>["stats"];
  statsByLanguage: ReturnType<typeof useHistoryStats>["statsByLanguage"];
  statsByMode: ReturnType<typeof useHistoryStats>["statsByMode"];
  wpmProgressionData: ReturnType<typeof useHistoryStats>["wpmProgressionData"];
  allAttempts: TypingAttempt[];
  onSelectAttempt: (attempt: TypingAttempt) => void;
}) {
  const sortedModes = Object.entries(statsByMode).sort(
    ([a], [b]) => (MODE_ORDER[a] ?? 999) - (MODE_ORDER[b] ?? 999),
  );

  return (
    <>
      <div className="mb-6 p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <SummaryStatCard label="best wpm" value={stats.bestWpm} highlight />
          <SummaryStatCard
            label="best acc"
            value={`${Math.round(stats.bestAccuracy)}%`}
            highlight
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
              onSelect={onSelectAttempt}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- page ---------------------------------- */

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

  const selectedAttempt = useMemo(
    () =>
      selectedAttemptId
        ? allAttempts.find((a) => a.id === selectedAttemptId) || null
        : null,
    [selectedAttemptId, allAttempts],
  );

  if (selectedAttempt) {
    return (
      <AttemptDetail
        attempt={selectedAttempt}
        onBack={() => setSelectedAttemptId(null)}
        onRetry={() => navigate("/")}
      />
    );
  }

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
            allAttempts={allAttempts}
            onSelectAttempt={(attempt) => setSelectedAttemptId(attempt.id)}
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

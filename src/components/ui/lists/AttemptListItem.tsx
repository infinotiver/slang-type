import { useMemo, useState } from "react";
import type { TypingAttempt } from "../../../types";
import SummaryStatCard from "../stats/SummaryStatCard";

interface AttemptListItemProps {
  attempt: TypingAttempt;
  formatDate: (timestamp: number) => string;
  getLanguageLabel: (lang: string) => string;
}

export default function AttemptListItem({
  attempt,
  formatDate,
  getLanguageLabel,
}: AttemptListItemProps) {
  const [expanded, setExpanded] = useState(false);

  const { rawWpm, adjustedWpm, errorRate } = useMemo(() => {
    const minutesElapsed = attempt.elapsed / 60;

    const raw =
      attempt.totalTyped > 0 && minutesElapsed > 0
        ? Math.round(attempt.totalTyped / 5 / minutesElapsed)
        : 0;

    const adjusted = Math.round((Math.round(attempt.accuracy) / 100) * raw);

    const errors =
      attempt.totalTyped > 0
        ? (
            ((attempt.totalTyped - attempt.correctChars) / attempt.totalTyped) *
            100
          ).toFixed(1)
        : "0.0";

    return {
      rawWpm: raw,
      adjustedWpm: adjusted,
      errorRate: errors,
    };
  }, [attempt]);

  return (
    <div className="rounded-4xl border border-secondary bg-secondary transition-colors my-1">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {formatDate(attempt.timestamp)}
            </div>

            <div className="mt-1 text-xs text-foreground/55">
              {attempt.mode} • {getLanguageLabel(attempt.language)}
              {attempt.aiGenerated && " • AI"}
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 text-sm">
            <div>
              <span className="text-foreground/50">wpm </span>
              <span className="font-bold text-highlight">{attempt.wpm}</span>
            </div>

            <div>
              <span className="text-foreground/50">acc </span>
              <span className="font-bold">{Math.round(attempt.accuracy)}%</span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-secondary px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <SummaryStatCard
              label="adjusted wpm"
              value={adjustedWpm}
              highlight
            />

            <SummaryStatCard label="raw wpm" value={rawWpm} />

            <SummaryStatCard
              label="accuracy"
              value={`${Math.round(attempt.accuracy)}%`}
            />

            <SummaryStatCard label="duration" value={`${attempt.elapsed}s`} />

            <SummaryStatCard label="typed" value={attempt.totalTyped} />

            <SummaryStatCard
              label="correct"
              value={attempt.correctChars}
              highlight
            />

            <SummaryStatCard label="errors" value={attempt.errors} />

            <SummaryStatCard label="error rate" value={`${errorRate}%`} />
          </div>
        </div>
      )}
    </div>
  );
}

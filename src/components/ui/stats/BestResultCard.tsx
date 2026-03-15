import type { TypingAttempt } from "@shared-types/index";

interface BestResultCardProps {
  label: string;
  attempt: TypingAttempt | null;
}

export default function BestResultCard({
  label,
  attempt,
}: BestResultCardProps) {
  return (
    <div className="p-3 border border-secondary/30 rounded bg-secondary/5 hover:bg-secondary/10 hover:border-highlight transition-colors">
      <div className="text-xs font-semibold text-foreground/70 mb-2 capitalize">
        {label}
      </div>
      {attempt ? (
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-foreground/50 text-xs">wpm</span>
            <span className="text-lg font-bold text-highlight">
              {attempt.wpm}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-foreground/50 text-xs">acc</span>
            <span className="text-sm font-semibold">
              {Math.round(attempt.accuracy)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="text-foreground/30 text-xs">no attempts</div>
      )}
    </div>
  );
}

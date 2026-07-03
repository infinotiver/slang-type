import type { TypingAttempt } from "@shared-types/index";
import { formatPercent } from "@/utils/numberFormat";

// Stat card for simple label + value display
interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div>
      <div className="text-xs text-foreground/60">{label}</div>
      <div
        className={`text-2xl font-bold ${
          highlight ? "text-highlight" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// Stat card for displaying attempt metrics (wpm + accuracy)
interface ResultCardProps {
  label: string;
  attempt: TypingAttempt | null;
}

export function ResultCard({ label, attempt }: ResultCardProps) {
  return (
    <div className="p-3 border border-secondary/30 rounded bg-secondary/5 hover:bg-secondary/10 hover:border-highlight transition-colors">
      <div className="text-xs font-semibold text-foreground mb-2 capitalize">
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
              {formatPercent(attempt.accuracy)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-foreground/30 text-xs">no attempts</div>
      )}
    </div>
  );
}

// Export defaults for backwards compatibility
export { StatCard as default };

import type { TypingAttempt } from "@shared-types/index";
import { formatPercent } from "@/utils/numberFormat";

interface BestResultCardProps {
  label: string;
  attempt: TypingAttempt | null;
  className?: string;
}

export default function BestResultCard({
  label,
  attempt,
  className = "",
}: BestResultCardProps) {
  if (!attempt) return null;

  return (
    <div
      className={`flex items-center gap-2.5 p-1 rounded-full bg-secondary border border-accent/40 whitespace-nowrap text-xs ${className}`}
    >
      <span className="chip-inner">{label}</span>
      <span className="text-xs font-bold text-highlight">
        {attempt.wpm}{" "}
        <span className="text-foreground/40 font-normal">wpm</span>
      </span>
      <span className="w-1 h-1 rounded-full bg-foreground/20" />
      <span className="text-xs font-semibold text-foreground">
        {formatPercent(attempt.accuracy)}
      </span>
    </div>
  );
}

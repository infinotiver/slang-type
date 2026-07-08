import type { TypingAttempt } from "@shared-types/index";
import { formatPercent } from "@/utils/numberFormat";

interface BestResultCardProps {
  label: string;
  attempt: TypingAttempt | null;
}

export default function BestResultCard({
  label,
  attempt,
}: BestResultCardProps) {
  if (!attempt) return null;

  return (
    <div className="flex items-center gap-2.5 p-1 rounded-full bg-secondary whitespace-nowrap text-xs">
      <span className="px-4 py-2 rounded-full bg-highlight/15 text-highlight  font-bold capitalize">
        {label}
      </span>
      <span className="text-xs font-bold text-highlight">
        {attempt.wpm}{" "}
        <span className="text-foreground/50 font-normal">wpm</span>
      </span>
      <span className="w-1 h-1 rounded-full bg-foreground/20" />
      <span className="text-xs font-semibold text-foreground">
        {formatPercent(attempt.accuracy)}
      </span>
    </div>
  );
}

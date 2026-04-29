import type { TypingAttempt } from "../../../types";

interface AttemptListItemProps {
  attempt: TypingAttempt;
  formatDate: (timestamp: number) => string;
  getLanguageLabel: (lang: string) => string;
  onSelect: (attempt: TypingAttempt) => void;
}

export default function AttemptListItem({
  attempt,
  formatDate,
  getLanguageLabel,
  onSelect,
}: AttemptListItemProps) {
  return (
    <button
      onClick={() => onSelect(attempt)}
      className="w-full flex items-center justify-between py-2 px-3 bg-secondary/15 rounded border border-secondary/30 hover:border-highlight hover:bg-secondary/25 transition-colors text-left text-xs font-mono"
    >
      <div className="flex-1 min-w-0">
        <div className="text-foreground">{formatDate(attempt.timestamp)}</div>
        <div className="text-foreground/50 text-xs">
          {getLanguageLabel(attempt.language)} | {attempt.mode}
          {attempt.aiGenerated ? " • AI" : ""}
        </div>
      </div>
      <div className="flex gap-4 ml-4 text-right whitespace-nowrap">
        <div>
          <span className="text-foreground/50">wpm </span>
          <span className="text-highlight font-semibold">{attempt.wpm}</span>
        </div>
        <div>
          <span className="text-foreground/50">acc </span>
          <span className="font-semibold">{Math.round(attempt.accuracy)}%</span>
        </div>
      </div>
    </button>
  );
}

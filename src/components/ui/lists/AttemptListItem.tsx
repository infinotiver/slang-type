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
      className="flex items-center justify-between px-6 py-2 my-1 bg-secondary/40 rounded-full border border-secondary hover:bg-secondary transition-colors text-left text-xs font-mono"
    >
      <div className="flex-1 flex gap-4 items-center min-w-0">
        <div className="text-foreground">{formatDate(attempt.timestamp)}</div>
        <div className="text-foreground/50 text-xs">
          {attempt.mode} | {getLanguageLabel(attempt.language)}
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

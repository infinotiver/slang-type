import { TbArrowLeft } from "react-icons/tb";
import { Button } from "@components/ui/common";
import type { TypingAttempt } from "@shared-types/index";
import { formatDate, getLanguageLabel } from "./utils";
import { formatPercent } from "@/utils/numberFormat";

interface ProfileAttemptDetailProps {
  attempt: TypingAttempt;
  onBack: () => void;
  onTryAgain: () => void;
}

export default function ProfileAttemptDetail({
  attempt,
  onBack,
  onTryAgain,
}: ProfileAttemptDetailProps) {
  const minutes = attempt.elapsed / 60;
  const rawWpm =
    attempt.totalTyped > 0 ? Math.round(attempt.totalTyped / 5 / minutes) : 0;
  const adjustedWpm = Math.round((Math.round(attempt.accuracy) / 100) * rawWpm);

  return (
    <div className="bg-background text-foreground flex flex-col font-mono">
      <header className="py-4 sm:py-5 border-b border-secondary/40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2"
            aria-label="back"
          >
            <TbArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wider">
              attempt details
            </h1>
            <p className="text-xs text-foreground/60 mt-1">
              {formatDate(attempt.timestamp)}
              {attempt.aiGenerated ? " • AI generated" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-4 sm:py-6">
        <div className="mb-6 pb-6 border-b border-secondary/35">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-foreground/70 tracking-wider font-light">
                test type
              </div>
              <div className="text-sm font-mono">
                {getLanguageLabel(attempt.language)} / {attempt.mode}
              </div>
            </div>
            <div>
              <div className="text-xs text-foreground/70 tracking-wider font-light">
                duration
              </div>
              <div className="text-sm font-mono">{attempt.elapsed}s</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
            performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "adjusted wpm", value: adjustedWpm, highlight: true },
              { label: "raw wpm", value: rawWpm },
              { label: "accuracy", value: formatPercent(attempt.accuracy) },
              { label: "time elapsed", value: `${attempt.elapsed}s` },
            ].map(({ label, value, highlight }) => (
              <div key={label}>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  {label}
                </div>
                <div
                  className={`text-2xl font-bold ${highlight ? "text-highlight" : "text-foreground"}`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
            character stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "total typed", value: attempt.totalTyped },
              {
                label: "correct",
                value: attempt.correctChars,
                className: "text-highlight",
              },
              {
                label: "errors",
                value: attempt.errors,
                className: "text-red-500",
              },
              {
                label: "error rate",
                value:
                  attempt.totalTyped > 0
                    ? formatPercent(
                        ((attempt.totalTyped - attempt.correctChars) /
                          attempt.totalTyped) *
                          100,
                        1,
                      )
                    : formatPercent(0, 1),
              },
            ].map(({ label, value, className }) => (
              <div key={label}>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  {label}
                </div>
                <div className={`text-lg font-semibold ${className ?? ""}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={onTryAgain}>try again</Button>
        </div>
      </main>
    </div>
  );
}

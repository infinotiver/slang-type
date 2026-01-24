import { useState } from "react";

interface TypingAttempt {
  id: string;
  timestamp: number;
  language: string;
  mode: string;
  wpm: number;
  accuracy: number;
  elapsed: number;
  correctChars: number;
  totalTyped: number;
  errors: number;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: TypingAttempt[];
}

export default function HistoryModal({
  isOpen,
  onClose,
  attempts,
}: HistoryModalProps) {
  const [selectedAttempt, setSelectedAttempt] = useState<TypingAttempt | null>(
    null,
  );

  if (!isOpen) return null;

  const stats = {
    totalAttempts: attempts.length,
    bestWpm: attempts.length > 0 ? Math.max(...attempts.map((a) => a.wpm)) : 0,
    avgWpm:
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.wpm, 0) / attempts.length,
          )
        : 0,
    bestAccuracy:
      attempts.length > 0 ? Math.max(...attempts.map((a) => a.accuracy)) : 0,
    avgAccuracy:
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length,
          )
        : 0,
    totalTime: attempts.reduce((sum, a) => sum + a.elapsed, 0),
  };

  const recentAttempts = [...attempts].reverse().slice(0, 10);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      slang: "slang",
      english: "english",
      code: "code",
    };
    return labels[lang] || lang;
  };

  // Show detail view for selected attempt
  if (selectedAttempt) {
    const minutesElapsed = selectedAttempt.elapsed / 60;
    const adjustedWpm =
      selectedAttempt.correctChars > 0
        ? Math.round(selectedAttempt.correctChars / 5 / minutesElapsed)
        : 0;
    const rawWpm =
      selectedAttempt.totalTyped > 0
        ? Math.round(selectedAttempt.totalTyped / 5 / minutesElapsed)
        : 0;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
          <div className="bg-background border border-secondary rounded-lg p-6 sm:p-8 w-full max-w-2xl shadow-lg pointer-events-auto max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-bold font-mono">
                attempt details
              </h2>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="text-foreground hover:text-highlight transition-colors active:scale-95 p-1"
                aria-label="back"
              >
                ←
              </button>
            </div>

            {/* Test Info */}
            <div className="mb-8 pb-8 border-b border-secondary/40">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    date
                  </div>
                  <div className="text-sm font-mono">
                    {formatDate(selectedAttempt.timestamp)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    test type
                  </div>
                  <div className="text-sm font-mono">
                    {getLanguageLabel(selectedAttempt.language)} /{" "}
                    {selectedAttempt.mode}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mb-8">
              <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
                performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    adjusted wpm
                  </div>
                  <div className="text-2xl font-bold text-highlight">
                    {adjustedWpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    raw wpm
                  </div>
                  <div className="text-2xl font-bold text-secondary">
                    {rawWpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    accuracy
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(selectedAttempt.accuracy)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    time elapsed
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {selectedAttempt.elapsed}s
                  </div>
                </div>
              </div>
            </div>

            {/* Character Stats */}
            <div className="mb-8">
              <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
                character stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    total typed
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedAttempt.totalTyped}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    correct
                  </div>
                  <div className="text-lg font-semibold text-highlight">
                    {selectedAttempt.correctChars}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    errors
                  </div>
                  <div className="text-lg font-semibold text-red-500">
                    {selectedAttempt.errors}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    error rate
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedAttempt.totalTyped > 0
                      ? (
                          ((selectedAttempt.totalTyped -
                            selectedAttempt.correctChars) /
                            selectedAttempt.totalTyped) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main history view
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="bg-background border border-secondary rounded-lg p-6 sm:p-8 w-full max-w-2xl shadow-lg pointer-events-auto max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold font-mono">
              history
            </h2>
            <button
              onClick={onClose}
              className="text-foreground hover:text-highlight transition-colors active:scale-95 p-1"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          {/* Statistics Overview */}
          <div className="mb-8">
            <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
              overall stats
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  total attempts
                </div>
                <div className="text-xl font-bold text-highlight">
                  {stats.totalAttempts}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  best wpm
                </div>
                <div className="text-xl font-bold text-highlight">
                  {stats.bestWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  avg wpm
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stats.avgWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  best accuracy
                </div>
                <div className="text-xl font-bold text-foreground">
                  {Math.round(stats.bestAccuracy)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  avg accuracy
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stats.avgAccuracy}%
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/70 tracking-wider font-light">
                  total time
                </div>
                <div className="text-xl font-bold text-foreground">
                  {Math.round(stats.totalTime / 60)}m
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attempts */}
          {attempts.length > 0 ? (
            <div>
              <h3 className="text-sm font-mono text-foreground/70 mb-4 tracking-wider">
                recent attempts
              </h3>
              <div className="space-y-2">
                {recentAttempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => setSelectedAttempt(attempt)}
                    className="w-full flex justify-between items-center py-2 px-3 bg-secondary/20 rounded border border-secondary/40 hover:border-highlight hover:bg-secondary/30 transition-colors text-left text-xs font-mono"
                  >
                    <div className="flex-1">
                      <div className="text-foreground/70">
                        {formatDate(attempt.timestamp)}
                      </div>
                      <div className="text-foreground/50 text-xs mt-1">
                        {getLanguageLabel(attempt.language)} / {attempt.mode}
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <span className="text-foreground/70">wpm: </span>
                        <span className="text-highlight font-semibold">
                          {attempt.wpm}
                        </span>
                      </div>
                      <div>
                        <span className="text-foreground/70">acc: </span>
                        <span className="text-foreground font-semibold">
                          {Math.round(attempt.accuracy)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-foreground/70 text-center py-8">
              no attempts yet. start typing to build your history!
            </div>
          )}
        </div>
      </div>
    </>
  );
}

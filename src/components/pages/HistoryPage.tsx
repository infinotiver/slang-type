import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import useLocalStorage from "../../hooks/useLocalStorage";
import type { TypingAttempt } from "../../types";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [attempts] = useLocalStorage<TypingAttempt[]>("slangtype_attempts", []);
  const [selectedAttempt, setSelectedAttempt] = useState<TypingAttempt | null>(
    null,
  );

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

  const allAttempts = [...attempts].reverse();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
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
      <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
        {/* Detail Header */}
        <header className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 border-b border-secondary/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAttempt(null)}
              className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95 -ml-2"
              aria-label="back"
              title="back to history"
            >
              <TbArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wider">
                attempt details
              </h1>
              <p className="text-xs text-foreground/60 mt-1">
                {formatDate(selectedAttempt.timestamp)}
              </p>
            </div>
          </div>
        </header>

        {/* Detail Content */}
        <main className="flex-1 px-4 sm:px-8 md:px-12 py-8 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            {/* Test Info */}
            <div className="mb-8 pb-8 border-b border-secondary/40">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    test type
                  </div>
                  <div className="text-sm font-mono">
                    {getLanguageLabel(selectedAttempt.language)} /{" "}
                    {selectedAttempt.mode}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    duration
                  </div>
                  <div className="text-sm font-mono">
                    {selectedAttempt.elapsed}s
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
        </main>
      </div>
    );
  }

  // Main history list view
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
      {/* Header */}
      <header className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 border-b border-secondary/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95 -ml-2"
            aria-label="back"
            title="back to typing"
          >
            <TbArrowLeft size={24} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-wider">
            history
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-8 md:px-12 py-8">
        {attempts.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {/* Statistics Overview */}
            <div className="mb-12">
              <h2 className="text-sm font-mono text-foreground/70 mb-6 tracking-wider">
                overall stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-6 border border-secondary/40 rounded">
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    total attempts
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-highlight mt-3">
                    {stats.totalAttempts}
                  </div>
                </div>
                <div className="p-6 border border-secondary/40 rounded">
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    best wpm
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-highlight mt-3">
                    {stats.bestWpm}
                  </div>
                </div>
                <div className="p-6 border border-secondary/40 rounded">
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    avg wpm
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                    {stats.avgWpm}
                  </div>
                </div>
                <div className="p-6 border border-secondary/40 rounded">
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    best accuracy
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                    {Math.round(stats.bestAccuracy)}%
                  </div>
                </div>
                <div className="p-6 border border-secondary/40 rounded">
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    avg accuracy
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                    {stats.avgAccuracy}%
                  </div>
                </div>
                <div className="p-6 border border-secondary/40 rounded">
                  <div className="text-xs text-foreground/70 tracking-wider font-light">
                    total time
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
                    {formatTime(stats.totalTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* All Attempts */}
            <div>
              <h2 className="text-sm font-mono text-foreground/70 mb-6 tracking-wider">
                all attempts ({allAttempts.length})
              </h2>
              <div className="space-y-2">
                {allAttempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => setSelectedAttempt(attempt)}
                    className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 px-4 bg-secondary/20 rounded border border-secondary/40 hover:border-highlight hover:bg-secondary/30 transition-colors text-left text-xs font-mono gap-3 sm:gap-0"
                  >
                    <div className="flex-1">
                      <div className="text-foreground/70">
                        {formatDate(attempt.timestamp)}
                      </div>
                      <div className="text-foreground/50 text-xs mt-1">
                        {getLanguageLabel(attempt.language)} / {attempt.mode}
                      </div>
                    </div>
                    <div className="flex gap-6 sm:gap-8 text-right">
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
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-sm text-foreground/70 text-center">
              no attempts yet. start typing to build your history!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

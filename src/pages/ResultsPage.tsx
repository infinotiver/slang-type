import { useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { useResultsStats } from "@hooks/useResultsStats";
import useLocalStorage from "@hooks/useLocalStorage";
import type { ResultsPayload, TypingAttempt } from "@shared-types/index";
import PerformanceChart from "@/components/results/PerformanceChart";
import { formatPercent } from "@/utils/numberFormat";

interface ResultsLocationState {
  results: ResultsPayload;
}

function getRejectReason({
  accuracy,
  netWpm,
  elapsed,
  charsPerSecond,
}: {
  accuracy: number;
  netWpm: number;
  elapsed: number;
  charsPerSecond: number;
}) {
  if (accuracy < 50) {
    return "Test accuracy is too low to keep (needs ≥50%).";
  }
  if (netWpm < 10) {
    return "Speed is too low to keep (WPM under 10).";
  }
  if (elapsed >= 40 && charsPerSecond < 0.4) {
    return "Too much idle time during the test.";
  }
  return null;
}

const EMPTY_RESULTS: ResultsPayload = {
  id: "",
  wpm: 0,
  accuracy: 0,
  errors: 0,
  elapsed: 0,
  totalTyped: 0,
  correctChars: 0,
  charStatus: {},
  targetText: "",
  mode: "30s",
  language: "slang",
  isNewHighScore: false,
  isBaseline: false,
  aiGenerated: false,
};

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsLocationState;
  const results = state?.results ?? EMPTY_RESULTS;

  const [, setAttempts] = useLocalStorage<TypingAttempt[]>(
    "slangtype_attempts",
    [],
  );
  const hasSavedAttemptRef = useRef(false);

  const {
    accuracy,
    errors,
    elapsed,
    totalTyped,
    correctChars,
    charStatus,
    mode,
    language,
    isNewHighScore,
    isBaseline,
  } = results;

  const stats = useResultsStats({
    elapsed,
    totalTyped,
    errors,
    correctChars,
    accuracy,
    charStatus,
  });

  const netWpm = stats.netWpm;
  const grossWpm = stats.grossWpm;

  const rejectReason = useMemo(
    () =>
      getRejectReason({
        accuracy,
        netWpm,
        elapsed,
        charsPerSecond: stats.charsPerSecond,
      }),
    [accuracy, netWpm, elapsed, stats.charsPerSecond],
  );

  const reportGlobalUsage = useCallback(async () => {
    try {
      await fetch("/api/stats/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elapsed,
          totalTyped,
        }),
      });
    } catch {
      // best-effort only
    }
  }, [elapsed, totalTyped]);

  useEffect(() => {
    if (!state?.results || hasSavedAttemptRef.current) return;
    hasSavedAttemptRef.current = true;

    if (rejectReason) return;
    void reportGlobalUsage();

    const attempt: TypingAttempt = {
      id: results.id,
      timestamp: Date.now(),
      wpm: stats.netWpm,
      accuracy: stats.accuracy,
      errors,
      elapsed,
      mode,
      language,
      totalTyped,
      correctChars,
      targetText: results.targetText,
      charStatus: results.charStatus,
      aiGenerated: Boolean(results.aiGenerated),
    };

    setAttempts((prev) => {
      if (prev.some((existing) => existing.id === attempt.id)) return prev;
      return [...prev, attempt];
    });
  }, [
    state,
    results,
    setAttempts,
    stats.netWpm,
    stats.accuracy,
    errors,
    elapsed,
    mode,
    language,
    totalTyped,
    correctChars,
    rejectReason,
    reportGlobalUsage,
  ]);

  if (!state || !state.results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-foreground">No results to display</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground flex flex-col font-mono">
      <div className="w-full">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-foreground/60 hover:text-highlight transition-colors active:scale-95 -ml-2 shrink-0"
            aria-label="back"
            title="back to typing"
          >
            <TbArrowLeft size={24} className="text-inherit" />
          </button>
          <div className="flex-1 -ml-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-wider leading-tight">
              results
            </h2>
            <p className="text-xs text-foreground/60 mt-1 leading-tight">
              {language} / {mode} • {elapsed}s
              {results.aiGenerated ? " • AI generated words" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {results.aiGenerated && (
              <span className="px-3 py-1 text-[11px] uppercase tracking-widest rounded-full bg-highlight/15 text-highlight border border-highlight/40 shadow-sm">
                AI generated
              </span>
            )}
            {isBaseline && (
              <div className="text-xs sm:text-sm text-foreground">
                baseline established
              </div>
            )}
            {isNewHighScore && !isBaseline && (
              <div className="text-xs sm:text-sm text-foreground">
                new high score
              </div>
            )}
          </div>
        </div>
        {rejectReason && (
          <div className="px-4  text-xs text-red-400 font-mono bg-secondary rounded py-2 mb-4">
            {rejectReason}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 flex-1">
          <div className="lg:w-50 flex flex-col gap-6 shrink-0">
            <div className="p-4 bg-highlight/10 rounded-full flex flex-col justify-between min-h-55">
              {/* Upper Stats */}
              <div className="space-y-4">
                <section>
                  <div className="text-sm text-foreground/60">wpm</div>
                  <div className="text-5xl font-extrabold text-highlight leading-none">
                    {netWpm}
                  </div>
                </section>

                <section>
                  <div className="text-sm text-foreground/60">accuracy</div>
                  <div className="text-5xl font-extrabold text-foreground leading-none">
                    {formatPercent(stats.accuracy)}
                  </div>
                </section>
              </div>

              {/* Lower Metadata */}
              <div className="text-xs text-foreground/60">
                raw wpm: <span className="text-foreground">{grossWpm}</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <PerformanceChart data={stats.performanceData} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">errors</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {errors}
            </div>
            <div className="text-[11px] text-foreground/50 mt-1">
              {formatPercent(stats.errorRate, 1)} rate
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">pace</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.charsPerSecond} c/s
            </div>
            <div className="text-[11px] text-foreground/50 mt-1">
              {stats.timePerChar}s / char
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">consistency</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {formatPercent(stats.consistency, 1)}
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">coverage</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.correctWords} / {stats.wordsTyped}
            </div>
            <div className="text-[11px] text-foreground/50 mt-1">
              words • {stats.correctChars}/{totalTyped} chars
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

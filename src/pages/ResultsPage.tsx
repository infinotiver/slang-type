import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { useResultsStats } from "@hooks/useResultsStats";
import { Button } from "@components/ui/common";
import useLocalStorage from "@hooks/useLocalStorage";
import type { ResultsPayload, TypingAttempt } from "@shared-types/index";
import PerformanceChart from "@/components/results/PerformanceChart";
import { formatPercent, roundTo } from "@/utils/numberFormat";

interface ResultsLocationState {
  results: ResultsPayload;
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
  const [rejectReason, setRejectReason] = useState<string | null>(null);

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

  useEffect(() => {
    if (!state?.results || hasSavedAttemptRef.current) return;
    hasSavedAttemptRef.current = true;

    const reject = getRejectReason({
      accuracy,
      netWpm,
      elapsed,
      totalTyped,
    });
    setRejectReason(reject);
    if (reject) return;

    const attempt: TypingAttempt = {
      id: results.id,
      timestamp: Number(results.id.split("-")[0]) || Date.now(),
      wpm: stats.netWpm,
      rawWpm: stats.grossWpm,
      adjustedWpm: stats.netWpm,
      accuracy: roundTo(accuracy),
      errors,
      errorRate: roundTo(stats.errorRate, 1),
      elapsed,
      mode,
      language,
      totalTyped,
      correctChars,
      timePerChar: roundTo(stats.timePerChar, 2),
      charsPerSecond: roundTo(stats.charsPerSecond, 2),
      consistency: roundTo(stats.consistency, 1),
      keystrokesPerSecond: roundTo(stats.keystrokesPerSecond, 2),
      targetText: results.targetText,
      charStatus: results.charStatus,
      performanceData: stats.performanceData,
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
    stats.grossWpm,
    stats.errorRate,
    stats.timePerChar,
    stats.charsPerSecond,
    stats.consistency,
    stats.keystrokesPerSecond,
    stats.performanceData,
    accuracy,
    errors,
    elapsed,
    mode,
    language,
    totalTyped,
    correctChars,
  ]);

  if (!state || !state.results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-foreground/70">No results to display</p>
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
              <span className="px-3 py-1 text-[11px] uppercase tracking-[0.1em] rounded-full bg-highlight/15 text-highlight border border-highlight/40 shadow-sm">
                AI generated
              </span>
            )}
            {isBaseline && (
              <div className="text-xs sm:text-sm text-foreground/70">
                baseline established
              </div>
            )}
            {isNewHighScore && !isBaseline && (
              <div className="text-xs sm:text-sm text-foreground/70">
                new high score
              </div>
            )}
            <Button onClick={() => navigate("/")} variant="primary">
              try again
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-1">
          <div className="lg:w-50 flex flex-col gap-6 shrink-0">
            <div className="p-4 bg-highlight/10 rounded-xl flex flex-col justify-between min-h-55">
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
            <div className="text-xs text-foreground/60">time / char</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.timePerChar}s
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">chars / sec</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.charsPerSecond}
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">consistency</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {formatPercent(stats.consistency, 1)}
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">correct words</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.correctWords}
            </div>
            <div className="text-[11px] text-foreground/50 mt-1">
              {stats.correctChars} chars
            </div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">untyped</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.pendingChars}
            </div>
            <div className="text-[11px] text-foreground/50 mt-1">chars</div>
          </div>
          <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5 flex flex-col">
            <div className="text-xs text-foreground/60">words typed</div>
            <div className="text-2xl font-bold text-foreground mt-auto">
              {stats.wordsTyped}
            </div>
            <div className="text-[11px] text-foreground/50 mt-1">words</div>
          </div>
        </div>
      </div>
    </div>
  );
}

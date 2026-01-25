import { useMemo, useEffect } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Button from "./Button";

interface ResultsModalProps {
  wpm: number;
  accuracy: number;
  errors: number;
  elapsed: number;
  totalTyped: number;
  correctChars: number;
  charStatus: Record<number, "pending" | "correct" | "incorrect">;
  targetText: string;
  isNewHighScore?: boolean;
  isBaseline?: boolean;
  onReset: () => void;
}

export default function ResultsModal({
  accuracy,
  elapsed,
  totalTyped,
  correctChars,
  charStatus,
  isNewHighScore = false,
  isBaseline = false,
  onReset,
}: ResultsModalProps) {
  // Create confetti effect
  const createConfetti = () => {
    const confettiCount = 50;
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "fixed pointer-events-none font-bold text-2xl";
      confetti.textContent = Math.random() > 0.5 ? "🎉" : "✨";
      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.top = "-10px";
      confetti.style.animation = `fall ${2 + Math.random()}s linear forwards`;
      confetti.style.setProperty("--rotate", Math.random() * 360 + "deg");
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 2500);
    }

    // Add CSS animation
    if (!document.getElementById("confetti-styles")) {
      const style = document.createElement("style");
      style.id = "confetti-styles";
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(var(--rotate));
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  useEffect(() => {
    if (isNewHighScore || isBaseline) {
      createConfetti();
    }
  }, [isNewHighScore, isBaseline]);
  const accuracy_pct = Math.round(accuracy);
  const minutesElapsed = elapsed / 60;
  // Adjusted WPM: based on only correct characters (standard metric)
  const adjustedWpm =
    correctChars > 0 ? Math.round(correctChars / 5 / minutesElapsed) : 0;
  const incorrectChars = totalTyped - correctChars;
  const errorRate =
    totalTyped > 0 ? ((incorrectChars / totalTyped) * 100).toFixed(1) : "0.0";

  // WPM Progression with Error Rate
  const wpmProgressionData = useMemo(() => {
    const data = [];
    const interval = Math.max(1, Math.floor(elapsed / 15));
    for (let second = interval; second <= elapsed; second += interval) {
      let charCount = 0;
      let correctCount = 0;
      for (let i = 0; i < totalTyped; i++) {
        if (charStatus[i]) {
          charCount++;
          if (charStatus[i] === "correct") correctCount++;
        }
      }
      const estimatedTotal = Math.round((charCount / elapsed) * second);
      const estimatedCorrect = Math.round((correctCount / elapsed) * second);
      const estimatedIncorrect = estimatedTotal - estimatedCorrect;
      const adj_wpm =
        estimatedCorrect > 0
          ? Math.round(estimatedCorrect / 5 / (second / 60))
          : 0;
      const errorRate =
        estimatedTotal > 0
          ? Math.round((estimatedIncorrect / estimatedTotal) * 100)
          : 0;
      data.push({
        time: second,
        adjustedWpm: Math.max(0, adj_wpm),
        errorRate: errorRate,
      });
    }
    return data.length > 0
      ? data
      : [{ time: elapsed, adjustedWpm, errorRate: parseInt(errorRate) }];
  }, [elapsed, charStatus, adjustedWpm, totalTyped, errorRate]);

  // Detailed statistics
  const stats = useMemo(() => {
    const statusCounts = {
      correct: 0,
      incorrect: 0,
      pending: 0,
    };
    Object.values(charStatus).forEach((status) => {
      statusCounts[status]++;
    });

    const timePerChar =
      totalTyped > 0 ? (elapsed / totalTyped).toFixed(2) : "0.00";
    const charsPerSecond = (totalTyped / elapsed).toFixed(2);

    return {
      statusCounts,
      timePerChar,
      charsPerSecond,
    };
  }, [charStatus, totalTyped, elapsed]);

  const chartTooltip = {
    contentStyle: {
      backgroundColor: "rgb(31, 41, 55)",
      border: "1px solid rgb(75, 85, 99)",
      borderRadius: "6px",
      color: "rgb(243, 244, 246)",
    },
  };

  // Calculate raw WPM for chart
  const rawWpm =
    totalTyped > 0 ? Math.round(totalTyped / 5 / minutesElapsed) : 0;

  // Update WPM progression data to include raw WPM
  const wpmProgressionDataWithRaw = useMemo(() => {
    return wpmProgressionData.map((point) => ({
      ...point,
      rawWpm: Math.round((point.time / elapsed) * rawWpm),
    }));
  }, [wpmProgressionData, rawWpm, elapsed]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm z-40" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-background border border-secondary rounded-lg p-8 max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg pointer-events-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold font-mono">test_results</h2>
              {isBaseline && (
                <div className="text-sm font-mono text-green-400 mt-2">
                  baseline established!
                </div>
              )}
              {isNewHighScore && !isBaseline && (
                <div className="text-sm font-mono text-yellow-400 mt-2 animate-pulse">
                  high score smashed! 🎯
                </div>
              )}
            </div>
            <button
              onClick={onReset}
              className="text-foreground hover:text-highlight transition-colors text-lg font-mono p-1"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          {/* Two-column layout: Stats on left, Chart on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-10">
            {/* Left: Big Stats Vertically Stacked */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Adjusted WPM
                </div>
                <div className="text-5xl font-bold text-highlight">
                  {adjustedWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Raw WPM
                </div>
                <div className="text-4xl font-bold text-secondary">
                  {rawWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Accuracy
                </div>
                <div className="text-4xl font-bold text-highlight">
                  {accuracy_pct}%
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Duration
                </div>
                <div className="text-4xl font-bold text-highlight">
                  {elapsed}s
                </div>
              </div>
            </div>

            {/* Right: Performance Chart */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-mono tracking-widest text-foreground/60 mb-4 uppercase">
                performance_analysis
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={wpmProgressionDataWithRaw}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgb(75, 85, 99)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="rgb(107, 114, 128)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="rgb(107, 114, 128)"
                    style={{ fontSize: "12px" }}
                    label={{ value: "WPM", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip {...chartTooltip} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="adjustedWpm"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth={2}
                    dot={false}
                    name="Adjusted WPM"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rawWpm"
                    stroke="rgb(107, 114, 128)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    name="Raw WPM"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="bg-background/40 border border-secondary rounded-lg p-8 mb-10">
            <h3 className="text-sm font-mono tracking-widest text-foreground/60 mb-8 uppercase">
              detailed_statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Total Typed
                </div>
                <div className="text-3xl font-bold text-highlight">
                  {totalTyped}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Correct
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {stats.statusCounts.correct}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Incorrect
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {stats.statusCounts.incorrect}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Untyped
                </div>
                <div className="text-3xl font-bold text-foreground/50">
                  {stats.statusCounts.pending}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Error Rate
                </div>
                <div className="text-3xl font-bold text-orange-400">
                  {errorRate}%
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Time per Char
                </div>
                <div className="text-3xl font-bold text-foreground/70">
                  {stats.timePerChar}s
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Chars/sec
                </div>
                <div className="text-3xl font-bold text-foreground/70">
                  {stats.charsPerSecond}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Consistency
                </div>
                <div className="text-3xl font-bold text-foreground/70">
                  {(100 - parseFloat(errorRate)).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={onReset} variant="primary">
              try_again
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

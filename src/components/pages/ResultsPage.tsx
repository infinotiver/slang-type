import { useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  calculateResultStats,
  generateWpmProgressionData,
  countCharStatuses,
  chartTooltipStyle,
} from "../../utils/resultsCalculations";
import Button from "../ui/Button";
import type { Language, Mode, TypingAttempt } from "../../types";

interface ResultsLocationState {
  results: {
    wpm: number;
    accuracy: number;
    errors: number;
    elapsed: number;
    totalTyped: number;
    correctChars: number;
    charStatus: Record<number, "pending" | "correct" | "incorrect">;
    targetText: string;
    mode: Mode;
    language: Language;
    isNewHighScore: boolean;
    isBaseline: boolean;
  };
  highScore: number;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsLocationState;

  const {
    wpm,
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
  } = state?.results || {
    wpm: 0,
    accuracy: 0,
    errors: 0,
    elapsed: 0,
    totalTyped: 0,
    correctChars: 0,
    charStatus: {},
    mode: "30s",
    language: "slang",
    isNewHighScore: false,
    isBaseline: false,
  };

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

  // Use utility functions to calculate stats
  const stats = useMemo(() => {
    return calculateResultStats(
      elapsed,
      totalTyped,
      correctChars,
      accuracy,
      charStatus,
    );
  }, [elapsed, totalTyped, correctChars, accuracy, charStatus]);

  // Generate chart data
  const chartData = useMemo(() => {
    return generateWpmProgressionData(
      elapsed,
      totalTyped,
      correctChars,
      charStatus,
      accuracy,
    );
  }, [elapsed, totalTyped, correctChars, charStatus, accuracy]);

  // Count character statuses
  const statusCounts = useMemo(() => {
    return countCharStatuses(charStatus);
  }, [charStatus]);

  useEffect(() => {
    if (isNewHighScore || isBaseline) {
      createConfetti();
    }
  }, [isNewHighScore, isBaseline]);

  if (!state || !state.results) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-foreground/70">No results to display</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <main className="px-4 sm:px-8 md:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
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

          {/* Two-column layout: Stats on left, Chart on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-10">
            {/* Left: Big Stats Vertically Stacked */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Adjusted WPM
                </div>
                <div className="text-5xl font-bold text-highlight">
                  {stats.adjustedWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Raw WPM
                </div>
                <div className="text-4xl font-bold text-secondary">
                  {stats.rawWpm}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Accuracy
                </div>
                <div className="text-4xl font-bold text-highlight">
                  {stats.accuracy}%
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
              <div>
                <div className="text-xs text-foreground/60 tracking-widest mb-2 uppercase font-light">
                  Error Rate
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {stats.errorRate}%
                </div>
              </div>
            </div>

            {/* Right: Performance Chart */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-mono tracking-widest text-foreground/60 mb-4 uppercase">
                performance_analysis
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
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
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgb(107, 114, 128)"
                    style={{ fontSize: "12px" }}
                    label={{
                      value: "Error % / Acc %",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="adjustedWpm"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    name="Adjusted WPM"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rawWpm"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    name="Raw WPM"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errorRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Error Rate %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#ffff00"
                    strokeWidth={2}
                    dot={false}
                    name="Accuracy %"
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
                  {statusCounts.correct}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Incorrect
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {statusCounts.incorrect}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Untyped
                </div>
                <div className="text-3xl font-bold text-foreground/50">
                  {statusCounts.pending}
                </div>
              </div>
              <div className="p-6 border border-secondary/30 rounded">
                <div className="text-xs text-foreground/60 tracking-widest mb-3 uppercase font-light">
                  Error Rate
                </div>
                <div className="text-3xl font-bold text-orange-400">
                  {stats.errorRate}%
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
                  {(100 - parseFloat(stats.errorRate)).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                // Save attempt to history
                const attempt: TypingAttempt = {
                  id: `${Date.now()}-${Math.random()}`,
                  timestamp: Date.now(),
                  wpm,
                  accuracy: Math.round(accuracy),
                  errors,
                  elapsed,
                  mode,
                  language,
                  totalTyped,
                  correctChars,
                };
                navigate("/", { state: { newAttempt: attempt } });
              }}
              variant="primary"
            >
              try_again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

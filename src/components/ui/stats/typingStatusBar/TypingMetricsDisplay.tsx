import { motion } from "framer-motion";
import type { StatsDisplay } from "@shared-types/index";

interface TypingMetricsDisplayProps {
  display: StatsDisplay;
  wpm: number;
  accuracy: number;
  remaining: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function TypingMetricsDisplay({
  display,
  wpm,
  accuracy,
  remaining,
}: TypingMetricsDisplayProps) {
  switch (display) {
    case "compact":
      return (
        <motion.div
          className="flex items-center justify-center gap-0.5 sm:gap-1 text-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="font-bold text-sm sm:text-base">{wpm}</span>
          <span className="text-foreground/50">|</span>
          <span className="font-bold text-sm sm:text-base">
            {Math.round(accuracy)}%
          </span>
          <span className="text-foreground/50">|</span>
          <span className="font-bold text-sm sm:text-base text-highlight">
            {formatTime(remaining)}
          </span>
        </motion.div>
      );
    case "focus":
      return (
        <motion.div
          className="text-2xl sm:text-3xl font-bold text-highlight whitespace-nowrap"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {formatTime(remaining)}
        </motion.div>
      );
    case "normal":
    default:
      return (
        <motion.div
          className="flex items-center justify-center gap-4 sm:gap-6 h-10 sm:h-12"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-foreground/70 tracking-wider font-light">
              wpm
            </span>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              {wpm}
            </span>
          </div>
          <div className="w-px h-9 sm:h-10 bg-secondary/35" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-foreground/70 tracking-wider font-light">
              acc
            </span>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              {Math.round(accuracy)}%
            </span>
          </div>
          <div className="w-px h-9 sm:h-10 bg-secondary/35" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-foreground/70 tracking-wider font-light">
              time
            </span>
            <span className="text-lg sm:text-xl font-bold text-highlight">
              {formatTime(remaining)}
            </span>
          </div>
        </motion.div>
      );
  }
}

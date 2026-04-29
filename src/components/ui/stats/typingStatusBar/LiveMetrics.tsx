import { motion } from "framer-motion";
import { formatPercent } from "@/utils/numberFormat";

interface LiveMetricsProps {
  wpm: number;
  accuracy: number;
  remaining: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function LiveMetrics({
  wpm,
  accuracy,
  remaining,
}: LiveMetricsProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 sm:gap-6 h-10 sm:h-12"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-foreground tracking-wider font-light">
          wpm
        </span>
        <span className="text-lg sm:text-xl font-bold text-foreground">
          {wpm}
        </span>
      </div>
      <div className="w-px h-9 sm:h-10 bg-secondary/35" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-foreground tracking-wider font-light">
          acc
        </span>
        <span className="text-lg sm:text-xl font-bold text-foreground">
          {formatPercent(accuracy)}
        </span>
      </div>
      <div className="w-px h-9 sm:h-10 bg-secondary/35" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-foreground tracking-wider font-light">
          time
        </span>
        <span className="text-lg sm:text-xl font-bold text-highlight">
          {formatTime(remaining)}
        </span>
      </div>
    </motion.div>
  );
}

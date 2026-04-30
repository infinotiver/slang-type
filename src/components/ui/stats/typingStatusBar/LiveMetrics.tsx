import { motion } from "framer-motion";
import { formatPercent } from "@/utils/numberFormat";
import { formatTime } from "@/utils/timeFormat";
interface LiveMetricsProps {
  wpm: number;
  accuracy: number;
  remaining: number;
}

export default function LiveMetrics({
  wpm,
  accuracy,
  remaining,
}: LiveMetricsProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-6 sm:gap-8 h-16 sm:h-20"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-foreground tracking-wider">
          wpm
        </span>
        <span className="text-3xl sm:text-4xl font-black text-foreground">
          {wpm}
        </span>
      </div>
      <div className="w-px h-12 sm:h-14 bg-secondary/35" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-foreground tracking-wider">
          acc
        </span>
        <span className="text-3xl sm:text-4xl font-black text-foreground">
          {formatPercent(accuracy)}
        </span>
      </div>
      <div className="w-px h-12 sm:h-14 bg-secondary/35" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-foreground tracking-wider">
          time
        </span>
        <span className="text-3xl sm:text-4xl font-black text-highlight">
          {formatTime(remaining)}
        </span>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import TypingMetricsDisplay from "./TypingMetricsDisplay";
import TypingControlsPanel from "./TypingControlsPanel";
import type { TypingStatusBarProps } from "./types";

export default function TypingStatusBar({
  wpm = 0,
  accuracy = 0,
  language = "slang",
  mode = "30s",
  slangDisabled = false,
  onLanguageChange,
  onModeChange,
  elapsed = 0,
  duration = 0,
  display = "normal",
  isTypingRunning = false,
}: TypingStatusBarProps) {
  const remaining = Math.max(0, duration - elapsed);
  const controlsOptions = [
    { label: "slang", disabled: slangDisabled },
    { label: "english", disabled: false },
    { label: "code", disabled: true },
  ];

  const layoutClass =
    display === "compact"
      ? "flex-col items-center gap-1"
      : display === "focus"
        ? "flex-row items-center justify-center gap-2 sm:gap-3"
        : "flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-5 md:gap-8";

  return (
    <motion.div
      className={`w-full flex ${layoutClass} font-mono ${
        display === "compact" ? "text-xs sm:text-sm text-foreground/70" : ""
      }`}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: display === "compact" ? 1 : 1.01 }}
      whileTap={{ scale: display === "compact" ? 1 : 0.99 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {isTypingRunning && (
        <TypingMetricsDisplay
          display={display}
          wpm={wpm}
          accuracy={accuracy}
          remaining={remaining}
        />
      )}
      {(display === "compact" || display === "focus") && !isTypingRunning && (
        <div className="hidden md:block w-px h-14 bg-secondary/40" />
      )}
      {!isTypingRunning && (
        <TypingControlsPanel
          display={display}
          language={language}
          mode={mode}
          slangDisabled={slangDisabled}
          controlsOptions={controlsOptions}
          onLanguageChange={onLanguageChange}
          onModeChange={onModeChange}
        />
      )}
    </motion.div>
  );
}

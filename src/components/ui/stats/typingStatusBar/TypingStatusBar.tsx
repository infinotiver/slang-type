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
  isTypingRunning = false,
}: TypingStatusBarProps) {
  const remaining = Math.max(0, duration - elapsed);
  const controlsOptions = [
    { label: "slang", disabled: slangDisabled },
    { label: "english", disabled: false },
    { label: "code", disabled: false },
  ];

  const layoutClass =
    "flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 md:gap-4";

  return (
    <motion.div
      className={`w-full flex ${layoutClass} font-mono`}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {isTypingRunning && (
        <TypingMetricsDisplay
          wpm={wpm}
          accuracy={accuracy}
          remaining={remaining}
        />
      )}
      {!isTypingRunning && (
        <TypingControlsPanel
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

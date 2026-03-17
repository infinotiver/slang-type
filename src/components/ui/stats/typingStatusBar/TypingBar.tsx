import { motion } from "framer-motion";
import LiveMetrics from "./LiveMetrics";
import ControlsPanel from "./ControlsPanel";
import type { TypingBarProps } from "./typingBar.types";

export default function TypingBar({
  wpm = 0,
  accuracy = 0,
  language = "slang",
  mode = "30s",
  onLanguageChange,
  onModeChange,
  onRequestAIWords,
  elapsed = 0,
  duration = 0,
  isTypingRunning = false,
}: TypingBarProps) {
  const remaining = Math.max(0, duration - elapsed);
  const controlsOptions = [
    { label: "slang", disabled: false },
    { label: "ai", disabled: false },
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
      {isTypingRunning ? (
        <LiveMetrics wpm={wpm} accuracy={accuracy} remaining={remaining} />
      ) : (
        <ControlsPanel
          language={language}
          mode={mode}
          controlsOptions={controlsOptions}
          onLanguageChange={onLanguageChange}
          onModeChange={onModeChange}
          onRequestAIWords={onRequestAIWords}
        />
      )}
    </motion.div>
  );
}

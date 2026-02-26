import { motion } from "framer-motion";
import { Button } from "@components/ui/common";
import type { TypingControlsOption } from "./types";

interface TypingControlsPanelProps {
  language: string;
  mode: string;
  slangDisabled: boolean;
  controlsOptions: TypingControlsOption[];
  onLanguageChange: (lang: string) => void;
  onModeChange: (mode: string) => void;
}

const modeOptions = ["15s", "30s", "60s", "120s", "inf"];

const controlButtonVariants = {
  hover: { scale: 1.04 },
  tap: { scale: 0.96 },
};

export default function TypingControlsPanel({
  language,
  mode,
  slangDisabled,
  controlsOptions,
  onLanguageChange,
  onModeChange,
}: TypingControlsPanelProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-3 sm:gap-4"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full sm:w-auto flex items-center gap-2">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="sm:hidden w-full px-3 py-2 bg-secondary/30 border border-secondary/60 text-sm font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/40 transition-colors focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
          disabled={slangDisabled && language === "slang"}
        >
          {controlsOptions.map((lang) => (
            <option key={lang.label} value={lang.label} disabled={lang.disabled}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="hidden sm:flex items-center gap-2">
          {controlsOptions.map((lang) => (
            <motion.div
              key={lang.label}
              whileHover="hover"
              whileTap="tap"
              variants={controlButtonVariants}
            >
              <Button
                onClick={() => onLanguageChange(lang.label)}
                variant={language === lang.label ? "primary" : "secondary"}
                className={language === lang.label ? "font-semibold" : ""}
                disabled={lang.disabled}
              >
                {lang.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="w-full sm:w-auto flex items-center gap-2">
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          className="sm:hidden w-full px-3 py-2 bg-secondary/30 border border-secondary/60 text-sm font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/40 transition-colors focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
        >
          {modeOptions.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
        <div className="hidden sm:flex items-center gap-2">
          {modeOptions.map((entry) => (
            <motion.div
              key={entry}
              whileHover="hover"
              whileTap="tap"
              variants={controlButtonVariants}
            >
              <Button
                onClick={() => onModeChange(entry)}
                variant={mode === entry ? "primary" : "secondary"}
                className={mode === entry ? "font-semibold" : ""}
              >
                {entry}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

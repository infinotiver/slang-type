import { motion } from "framer-motion";
import { Button } from "@components/ui/common";
import type { StatsDisplay } from "@shared-types/index";
import type { TypingControlsOption } from "./types";

interface TypingControlsPanelProps {
  display: StatsDisplay;
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
  display,
  language,
  mode,
  slangDisabled,
  controlsOptions,
  onLanguageChange,
  onModeChange,
}: TypingControlsPanelProps) {
  switch (display) {
    case "compact":
      return (
        <motion.div
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {controlsOptions.map((lang, idx) => (
              <motion.span
                key={lang.label}
                className="flex items-center gap-1 text-sm"
                whileHover="hover"
                whileTap="tap"
                variants={controlButtonVariants}
              >
                {idx > 0 && <span className="text-foreground/40">/</span>}
                <button
                  onClick={() => onLanguageChange(lang.label)}
                  className={`px-1 py-0.5 hover:text-highlight transition-colors ${
                    language === lang.label ? "text-highlight font-semibold" : ""
                  } ${lang.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={lang.disabled}
                >
                  {lang.label}
                </button>
              </motion.span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {modeOptions.map((entry, idx) => (
              <motion.span
                key={entry}
                className="flex items-center gap-1 text-sm"
                whileHover="hover"
                whileTap="tap"
                variants={controlButtonVariants}
              >
                {idx > 0 && <span className="text-foreground/40">/</span>}
                <button
                  onClick={() => onModeChange(entry)}
                  className={`px-1 py-0.5 hover:text-highlight transition-colors ${
                    mode === entry ? "text-highlight font-semibold" : ""
                  }`}
                >
                  {entry}
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      );
    case "focus":
      return (
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-1 text-sm bg-secondary/20 border border-secondary/50 font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/30 transition-colors focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
            disabled={slangDisabled && language === "slang"}
          >
            {controlsOptions.map((lang) => (
              <option key={lang.label} value={lang.label} disabled={lang.disabled}>
                {lang.label}
              </option>
            ))}
          </select>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value)}
            className="px-3 py-1 text-sm bg-secondary/20 border border-secondary/50 font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/30 transition-colors focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
          >
            {modeOptions.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </motion.div>
      );
    case "normal":
    default:
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
}

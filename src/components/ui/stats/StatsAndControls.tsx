import type { StatsAndControlsProps, StatsDisplay } from "@shared-types/index";
import { Button } from "@components/ui/common";
import { motion } from "framer-motion";

interface StatsAndControlsExtendedProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
  display?: StatsDisplay;
  isTypingRunning?: boolean;
}

export default function StatsAndControls({
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
}: StatsAndControlsExtendedProps) {
  const remaining = Math.max(0, duration - elapsed);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const renderStats = (displayMode: StatsDisplay) => {
    switch (displayMode) {
      case "compact":
        return (
          <motion.div
            className="flex items-center justify-center gap-0.5 sm:gap-1 text-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="font-bold text-sm sm:text-base">{wpm}</span>
            <span className="text-foreground/50">·</span>
            <span className="font-bold text-sm sm:text-base">
              {Math.round(accuracy)}%
            </span>
            <span className="text-foreground/50">·</span>
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
            className="flex items-center justify-center gap-2 md:gap-4 h-10 sm:h-12"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {[
              { label: "wpm", value: wpm.toString() },
              { label: "acc", value: `${Math.round(accuracy)}%` },
              { label: "time", value: formatTime(remaining), highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-xs text-foreground/70 tracking-wider font-light">
                  {label}
                </span>
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    highlight ? "text-highlight" : "text-foreground"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </motion.div>
        );
    }
  };

  const controlButtonVariants = {
    hover: { scale: 1.04 },
    tap: { scale: 0.96 },
  };

  const renderControls = (displayMode: StatsDisplay) => {
    switch (displayMode) {
      case "compact":
        return (
          <motion.div
            className="flex flex-col items-center gap-2"
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
                      language === lang.label
                        ? "text-highlight font-semibold"
                        : ""
                    } ${lang.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={lang.disabled}
                  >
                    {lang.label}
                  </button>
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              {["15s", "30s", "60s", "120s", "inf"].map((m, idx) => (
                <motion.span
                  key={m}
                  className="flex items-center gap-1 text-sm"
                  whileHover="hover"
                  whileTap="tap"
                  variants={controlButtonVariants}
                >
                  {idx > 0 && <span className="text-foreground/40">/</span>}
                  <button
                    onClick={() => onModeChange(m)}
                    className={`px-1 py-0.5 hover:text-highlight transition-colors ${
                      mode === m ? "text-highlight font-semibold" : ""
                    }`}
                  >
                    {m}
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
                <option
                  key={lang.label}
                  value={lang.label}
                  disabled={lang.disabled}
                >
                  {lang.label}
                </option>
              ))}
            </select>
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value)}
              className="px-3 py-1 text-sm bg-secondary/20 border border-secondary/50 font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/30 transition-colors focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
            >
              {["15s", "30s", "60s", "120s", "inf"].map((m) => (
                <option key={m} value={m}>
                  {m}
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
                  <option
                    key={lang.label}
                    value={lang.label}
                    disabled={lang.disabled}
                  >
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
                {["15s", "30s", "60s", "120s", "inf"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="hidden sm:flex items-center gap-2">
                {["15s", "30s", "60s", "120s", "inf"].map((m) => (
                  <motion.div
                    key={m}
                    whileHover="hover"
                    whileTap="tap"
                    variants={controlButtonVariants}
                  >
                    <Button
                      onClick={() => onModeChange(m)}
                      variant={mode === m ? "primary" : "secondary"}
                      className={mode === m ? "font-semibold" : ""}
                    >
                      {m}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
    }
  };

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
      {isTypingRunning && renderStats(display)}
      {(display === "compact" || display === "focus") && !isTypingRunning && (
        <div className="hidden md:block w-px h-14 bg-secondary/40"></div>
      )}
      {!isTypingRunning && renderControls(display)}
    </motion.div>
  );
}

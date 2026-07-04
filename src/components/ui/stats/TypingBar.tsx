import { motion } from "framer-motion";
import { formatPercent } from "@/utils/numberFormat";
import { formatTime } from "@/utils/timeFormat";
import type { StatsAndControlsProps } from "@shared-types/index";

interface TypingBarProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
  isTypingRunning?: boolean;
  onRequestAIWords?: () => void;
}

interface SegmentedOption {
  label: string;
  disabled?: boolean;
}

// Display live metrics during typing
function LiveMetrics({
  wpm,
  accuracy,
  remaining,
}: {
  wpm: number;
  accuracy: number;
  remaining: number;
}) {
  return (
    <motion.div
      className="flex items-center justify-center gap-6 sm:gap-8 h-16 sm:h-20"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-foreground tracking-wider">wpm</span>
        <span className="text-3xl sm:text-4xl font-black text-foreground">
          {wpm}
        </span>
      </div>
      <div className="w-px h-12 sm:h-14 bg-secondary/35" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-foreground tracking-wider">acc</span>
        <span className="text-3xl sm:text-4xl font-black text-foreground">
          {formatPercent(accuracy)}
        </span>
      </div>
      <div className="w-px h-12 sm:h-14 bg-secondary/35" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-foreground tracking-wider">time</span>
        <span className="text-3xl sm:text-4xl font-black text-highlight">
          {formatTime(remaining)}
        </span>
      </div>
    </motion.div>
  );
}

// Segmented button controls
function SegmentedButtons({
  options,
  selected,
  onSelect,
}: {
  options: SegmentedOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const baseButtonClass =
    "px-3 py-1.5 rounded-full text-xs tracking-wide border border-transparent transition-colors duration-150";
  const activeButtonClass = "font-semibold bg-highlight text-background";
  const inactiveButtonClass =
    "text-foreground bg-transparent hover:bg-secondary/25 hover:text-highlight/90 hover:border-secondary";

  return (
    <div className="hidden sm:flex items-center gap-1.5">
      {options.map((option) => (
        <button
          key={option.label}
          onClick={() => onSelect(option.label)}
          type="button"
          className={`${
            selected === option.label ? activeButtonClass : inactiveButtonClass
          } ${baseButtonClass}`}
          disabled={option.disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Control panel for language and mode selection
function ControlsPanel({
  language,
  mode,
  controlsOptions,
  onLanguageChange,
  onModeChange,
}: {
  language: string;
  mode: string;
  controlsOptions: SegmentedOption[];
  onLanguageChange: (lang: string) => void;
  onModeChange: (mode: string) => void;
}) {
  const modeOptions = ["15s", "30s", "60s", "120s", "inf"];
  const wrapperClass =
    "flex w-full items-center justify-center gap-2 sm:w-auto sm:gap-3";
  const segmentClass =
    "flex items-center gap-1 rounded-full bg-secondary p-1.5";
  const selectClass =
    "sm:hidden w-auto px-2 py-1 bg-secondary text-sm font-mono text-foreground rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-highlight hover:bg-secondary transition-colors";

  return (
    <div className={wrapperClass}>
      <div className={segmentClass}>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className={selectClass}
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
        <SegmentedButtons
          options={controlsOptions}
          selected={language}
          onSelect={onLanguageChange}
        />
      </div>

      <div className={segmentClass}>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          className={selectClass}
        >
          {modeOptions.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
        <SegmentedButtons
          options={modeOptions.map((entry) => ({ label: entry }))}
          selected={mode}
          onSelect={onModeChange}
        />
      </div>
    </div>
  );
}

// Main typing bar component
export default function TypingBar({
  wpm = 0,
  accuracy = 0,
  language = "slang",
  mode = "30s",
  onLanguageChange,
  onModeChange,
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
        />
      )}
    </motion.div>
  );
}

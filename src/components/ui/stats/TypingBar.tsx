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

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toOptions(values: string[]): SegmentedOption[] {
  return values.map((label) => ({ label }));
}

const MODE_OPTIONS = toOptions(["15s", "30s", "60s", "120s", "inf"]);
const LANGUAGE_OPTIONS: SegmentedOption[] = toOptions([
  "slang",
  "ai",
  "english",
  "code",
]);

const wrapperClass = "flex items-center gap-1 rounded-full bg-secondary/60 p-1";
const btnBaseClass =
  "px-4 py-2 rounded-full text-xs tracking-wide border border-transparent transition-colors duration-150";
const btnActiveClass = "font-semibold bg-highlight text-background";
const btnInactiveClass =
  "text-foreground bg-transparent hover:bg-secondary hover:text-highlight hover:border-secondary";

function MetricChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className={wrapperClass}>
      <span className={cn(btnBaseClass, btnActiveClass)}>{label}</span>
      <span className="flex items-center gap-1 px-2">
        {value}
      </span>
    </div>
  );
}

/** Select on mobile, pill buttons on larger screens. */
function SegmentedGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className={wrapperClass}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sm:hidden w-auto px-2 py-1 text-sm font-mono text-foreground rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-highlight hover:bg-secondary transition-colors"
      >
        {options.map((option) => (
          <option
            key={option.label}
            value={option.label}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      <div className="hidden sm:flex items-center gap-1.5">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.label)}
            disabled={option.disabled}
            className={cn(
              btnBaseClass,
              value === option.label ? btnActiveClass : btnInactiveClass,
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
      className="flex items-center justify-center gap-2 sm:gap-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <MetricChip label="wpm" value={wpm} />
      <MetricChip label="acc" value={formatPercent(accuracy)} />
      <MetricChip label="time" value={formatTime(remaining)} />
    </motion.div>
  );
}

function ControlsPanel({
  language,
  mode,
  languageOptions,
  onLanguageChange,
  onModeChange,
}: {
  language: string;
  mode: string;
  languageOptions: SegmentedOption[];
  onLanguageChange: (lang: string) => void;
  onModeChange: (mode: string) => void;
}) {
  return (
    <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:gap-3">
      <SegmentedGroup
        ariaLabel="Language"
        options={languageOptions}
        value={language}
        onChange={onLanguageChange}
      />
      <SegmentedGroup
        ariaLabel="Duration"
        options={MODE_OPTIONS}
        value={mode}
        onChange={onModeChange}
      />
    </div>
  );
}

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

  return (
    <motion.div
      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 md:gap-4 font-mono"
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
          languageOptions={LANGUAGE_OPTIONS}
          onLanguageChange={onLanguageChange}
          onModeChange={onModeChange}
        />
      )}
    </motion.div>
  );
}

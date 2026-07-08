import { motion, LayoutGroup } from "framer-motion";
import { memo, useState } from "react";
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
  "english",
  "ai",
  "code",
]);

const wrapperClass = "flex items-center gap-1 rounded-full bg-secondary p-1";
const btnBaseClass =
  "relative px-4 py-2 rounded-full text-xs tracking-wide transition-colors duration-150";
const activeTextClass = "font-semibold text-background";
const inactiveTextClass = "text-foreground hover:text-highlight";

const MetricChip = memo(function MetricChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className={wrapperClass}>
      <span
        className={cn(
          btnBaseClass,
          "bg-highlight text-background font-semibold",
        )}
      >
        {label}
      </span>
      <span className="flex items-center gap-1 px-2">{value}</span>
    </div>
  );
});

/**
 * Select on mobile, pill buttons on larger screens. The active button's
 * highlight is one shared element (via layoutId) that framer-motion
 * animates between buttons, instead of each button toggling its own
 * background instantly.
 */
const SegmentedGroup = memo(function SegmentedGroup({
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

      <LayoutGroup id={ariaLabel}>
        <div className="hidden sm:flex items-center gap-1.5">
          {options.map((option) => {
            const active = value === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(option.label)}
                disabled={option.disabled}
                className={cn(
                  btnBaseClass,
                  active ? activeTextClass : inactiveTextClass,
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`${ariaLabel}-highlight`}
                    className="absolute inset-0 rounded-full bg-highlight"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
});

const LiveMetrics = memo(function LiveMetrics({
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
});

const ControlsPanel = memo(function ControlsPanel({
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
});

function readStatsDisplayPreference(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem("slangtype_statsDisplay") || "default";
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
  const [statsDisplay] = useState(readStatsDisplayPreference);

  return (
    <motion.div
      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 md:gap-4 font-mono"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {isTypingRunning ? (
        statsDisplay === "default" && (
          <LiveMetrics wpm={wpm} accuracy={accuracy} remaining={remaining} />
        )
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

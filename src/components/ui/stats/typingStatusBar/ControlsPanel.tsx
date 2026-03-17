import type { ControlOption } from "./typingBar.types";

interface ControlsPanelProps {
  language: string;
  mode: string;
  controlsOptions: ControlOption[];
  onLanguageChange: (lang: string) => void;
  onModeChange: (mode: string) => void;
  onRequestAIWords?: () => void;
}

const modeOptions = ["15s", "30s", "60s", "120s", "inf"];

const wrapperClass =
  "w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-xl bg-secondary/50 px-1 py-1";
const segmentClass =
  "w-full sm:w-auto flex items-center gap-1 rounded-lg bg-background/50 p-1";
const selectClass =
  "sm:hidden w-full px-3 py-2 bg-background/60 border border-secondary/40 text-sm font-mono text-foreground rounded-md hover:bg-secondary/15 transition-colors focus:outline-none focus:ring-1 focus:ring-highlight/20";
const baseButtonClass =
  "px-3 py-1.5 rounded-md text-xs tracking-wide border border-transparent transition-colors duration-150";
const activeButtonClass =
  "font-semibold bg-highlight/15 text-highlight hover:bg-highlight/25 hover:border-highlight";
const inactiveButtonClass =
  "text-foreground/70 bg-transparent hover:bg-secondary/25 hover:text-highlight/90 hover:border-secondary";

interface SegmentedOption {
  label: string;
  disabled?: boolean;
}

function SegmentedButtons({
  options,
  selected,
  onSelect,
}: {
  options: SegmentedOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
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

export default function ControlsPanel({
  language,
  mode,
  controlsOptions,
  onLanguageChange,
  onModeChange,
}: ControlsPanelProps) {
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

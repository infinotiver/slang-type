import type { StatsAndControlsProps, StatsDisplay } from "../../types";
import Button from "./Button";

interface StatsAndControlsExtendedProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
  display?: StatsDisplay;
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
}: StatsAndControlsExtendedProps) {
  // Mini mode: return just the values with minimal styling
  if (display === "mini") {
    const controlsOptions = [
      { label: "slang", disabled: slangDisabled },
      { label: "english", disabled: false },
      { label: "code", disabled: true },
    ];

    return (
      <div className="flex flex-col items-center gap-3 font-mono text-xs text-foreground/70">
        <div className="flex items-center justify-center gap-4 text-foreground">
          <span className="font-bold">{wpm}</span>
          <span>·</span>
          <span className="font-bold">{Math.round(accuracy)}%</span>
        </div>
        <div className="flex items-center gap-2">
          {controlsOptions.map((lang, idx) => (
            <span key={lang.label}>
              {idx > 0 && <span className="mx-1">/</span>}
              <button
                onClick={() => onLanguageChange(lang.label)}
                className={`hover:text-highlight transition-colors ${
                  language === lang.label ? "text-highlight font-semibold" : ""
                } ${lang.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                disabled={lang.disabled}
              >
                {lang.label}
              </button>
            </span>
          ))}
          <span className="mx-2 text-foreground/40">·</span>
          {["15s", "30s", "60s", "120s", "inf"].map((m, idx) => (
            <span key={m}>
              {idx > 0 && <span className="mx-1">/</span>}
              <button
                onClick={() => onModeChange(m)}
                className={`hover:text-highlight transition-colors ${
                  mode === m ? "text-highlight font-semibold" : ""
                }`}
              >
                {m}
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Calculate remaining time for countdown display
  const remaining = Math.max(0, duration - elapsed);

  // Format time to MM:SS format
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

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-12 font-mono">
      {/* STATS PANEL */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 h-16 sm:h-20">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-foreground/70 tracking-wider font-light">
            wpm
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            {wpm}
          </span>
        </div>
        <div className="w-px h-10 sm:h-14 bg-secondary/40"></div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-foreground/70 tracking-wider font-light">
            acc
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            {Math.round(accuracy)}%
          </span>
        </div>
        <div className="w-px h-10 sm:h-14 bg-secondary/40"></div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-foreground/70 tracking-wider font-light">
            time
          </span>
          <span className="text-lg sm:text-xl font-bold text-highlight">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* HIDDEN DIVIDER ON DESKTOP */}
      <div className="hidden md:block w-px h-14 bg-secondary/40"></div>

      {/* CONTROLS PANEL */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-4">
        {/* Language - Dropdown on mobile, buttons on desktop */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="sm:hidden w-full px-3 py-2 bg-secondary/30 border border-secondary/60 text-sm font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/40 transition-colors active:scale-95 focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
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
              <Button
                key={lang.label}
                onClick={() => onLanguageChange(lang.label)}
                variant={language === lang.label ? "primary" : "secondary"}
                className={language === lang.label ? "font-semibold" : ""}
                disabled={lang.disabled}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Mode - Dropdown on mobile, buttons on desktop */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value)}
            className="sm:hidden w-full px-3 py-2 bg-secondary/30 border border-secondary/60 text-sm font-mono text-foreground rounded hover:border-highlight hover:bg-secondary/40 transition-colors active:scale-95 focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight/30"
          >
            {["15s", "30s", "60s", "120s", "inf"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <div className="hidden sm:flex items-center gap-2">
            {["15s", "30s", "60s", "120s", "inf"].map((m) => (
              <Button
                key={m}
                onClick={() => onModeChange(m)}
                variant={mode === m ? "primary" : "secondary"}
                className={mode === m ? "font-semibold" : ""}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

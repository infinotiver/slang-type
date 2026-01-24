import type { StatsAndControlsProps } from "../../types";

interface StatsAndControlsExtendedProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
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
}: StatsAndControlsExtendedProps) {
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
    <div className="flex items-center justify-center gap-16 font-mono">
      {/* STATS PANEL - WPM, Accuracy, Real-time Timer */}
      <div className="flex items-center gap-10 px-8 py-4 h-20">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-foreground tracking-wider font-light">
            wpm
          </span>
          <span className="text-lg font-bold text-foreground">{wpm}</span>
        </div>
        <div className="w-px h-12 bg-secondary"></div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-foreground tracking-wider font-light">
            acc
          </span>
          <span className="text-lg font-bold text-foreground">
            {Math.round(accuracy)}%
          </span>
        </div>
        <div className="w-px h-12 bg-secondary"></div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-foreground tracking-wider font-light">
            time
          </span>
          <span className="text-lg font-bold text-highlight">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* CONTROLS PANEL - Language and duration buttons */}
      <div className="flex items-center gap-8 px-6 py-4 h-20">
        {/* Language Controls */}
        <div className="flex items-center gap-3">
          {controlsOptions.map((lang) => (
            <button
              key={lang.label}
              onClick={() => onLanguageChange(lang.label)}
              className={`px-3 py-1.5 text-sm font-mono tracking-wide rounded transition-colors border ${
                language === lang.label
                  ? "border-highlight text-highlight font-semibold"
                  : "border-secondary text-foreground hover:border-highlight hover:text-highlight"
              } ${lang.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={lang.disabled}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-secondary"></div>

        {/* Duration Controls */}
        <div className="flex items-center gap-3">
          {["15s", "30s", "60s", "120s", "inf"].map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1.5 text-sm font-mono rounded tracking-wide transition-colors border ${
                mode === m
                  ? "border-highlight text-highlight font-semibold"
                  : "border-secondary text-foreground hover:border-highlight hover:text-highlight"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex items-center justify-center gap-12 font-mono">
      {/* STATS PANEL - WPM, Accuracy, Real-time Timer */}
      <div className="flex items-center gap-8 h-20">
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs text-foreground/70 tracking-wider font-light">
            wpm
          </span>
          <span className="text-xl font-bold text-foreground">{wpm}</span>
        </div>
        <div className="w-px h-14 bg-secondary/40"></div>
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs text-foreground/70 tracking-wider font-light">
            acc
          </span>
          <span className="text-xl font-bold text-foreground">
            {Math.round(accuracy)}%
          </span>
        </div>
        <div className="w-px h-14 bg-secondary/40"></div>
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs text-foreground/70 tracking-wider font-light">
            time
          </span>
          <span className="text-xl font-bold text-highlight">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* CONTROLS PANEL - Language and duration buttons */}
      <div className="flex items-center gap-8 h-20">
        {/* Language Controls */}
        <div className="flex items-center gap-2">
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

        <div className="w-px h-14 bg-secondary/40"></div>

        {/* Duration Controls */}
        <div className="flex items-center gap-2">
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
  );
}

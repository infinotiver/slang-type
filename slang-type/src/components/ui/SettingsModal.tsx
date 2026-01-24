import type { SettingsModalProps, Theme, DisplayMode } from "../../types";
import Button from "./Button";

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  displayMode = "normal",
  onDisplayModeChange,
}: SettingsModalProps & {
  displayMode?: DisplayMode;
  onDisplayModeChange?: (mode: DisplayMode) => void;
}) {
  if (!isOpen) return null;

  const themes: Theme[] = [
    "dark",
    "light",
    "latte",
    "frappe",
    "mocha",
    "nord",
    "gruvbox",
  ];
  const displayModes: { label: string; value: DisplayMode }[] = [
    { label: "normal", value: "normal" },
    { label: "tape-word", value: "tape-word" },
    { label: "tape-char", value: "tape-char" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-background border border-secondary rounded-lg p-8 w-100 shadow-lg pointer-events-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold font-mono">settings</h2>
            <button
              onClick={onClose}
              className="text-foreground hover:text-highlight transition-colors text-lg font-mono p-1"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          {/* Theme Setting */}
          <div className="mb-8">
            <label className="block text-sm font-mono text-foreground/70 mb-4 tracking-wider">
              theme
            </label>
            <div className="flex flex-wrap gap-3">
              {themes.map((t) => (
                <Button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  variant={theme === t ? "primary" : "secondary"}
                  className={theme === t ? "font-semibold" : ""}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Display Mode Setting */}
          <div>
            <label className="block text-sm font-mono text-foreground/70 mb-4 tracking-wider">
              display mode
            </label>
            <div className="flex flex-wrap gap-3">
              {displayModes.map((mode) => (
                <Button
                  key={mode.value}
                  onClick={() => onDisplayModeChange?.(mode.value)}
                  variant={displayMode === mode.value ? "primary" : "secondary"}
                  className={displayMode === mode.value ? "font-semibold" : ""}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

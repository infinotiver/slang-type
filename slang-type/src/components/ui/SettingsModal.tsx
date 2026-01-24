import type { SettingsModalProps, Theme, DisplayMode } from "../../types";

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
        <div className="bg-background border border-secondary rounded-lg p-8 w-96 shadow-lg pointer-events-auto">
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
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className={`px-4 py-2 font-mono text-sm rounded transition-colors border ${
                    theme === t
                      ? "border-highlight bg-secondary text-highlight font-semibold"
                      : "border-secondary text-foreground hover:border-highlight hover:text-highlight"
                  }`}
                >
                  {t}
                </button>
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
                <button
                  key={mode.value}
                  onClick={() => onDisplayModeChange?.(mode.value)}
                  className={`px-4 py-2 font-mono text-sm rounded transition-colors border ${
                    displayMode === mode.value
                      ? "border-highlight bg-secondary text-highlight font-semibold"
                      : "border-secondary text-foreground hover:border-highlight hover:text-highlight"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

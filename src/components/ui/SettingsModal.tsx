import type {
  SettingsModalProps,
  Theme,
  DisplayMode,
  StatsDisplay,
} from "../../types";
import ModalBase from "./ModalBase";
import ButtonGroup from "./ButtonGroup";

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  displayMode = "normal",
  onDisplayModeChange,
  statsDisplay = "normal",
  onStatsDisplayChange,
}: SettingsModalProps & {
  displayMode?: DisplayMode;
  onDisplayModeChange?: (mode: DisplayMode) => void;
  statsDisplay?: StatsDisplay;
  onStatsDisplayChange?: (display: StatsDisplay) => void;
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
  const themeOptions = themes.map((t) => ({ label: t, value: t }));
  const displayModeOptions: { label: string; value: DisplayMode }[] = [
    { label: "normal", value: "normal" },
    { label: "tape-word", value: "tape-word" },
    { label: "tape-char", value: "tape-char" },
  ];
  const statsDisplayOptions: { label: string; value: StatsDisplay }[] = [
    { label: "normal", value: "normal" },
    { label: "mini", value: "mini" },
    { label: "focus", value: "focus" },
  ];

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="settings">
      <div className="space-y-8">
        {/* Theme Setting */}
        <ButtonGroup
          label="theme"
          options={themeOptions}
          value={theme}
          onChange={onThemeChange}
        />

        {/* Display Mode Setting */}
        <ButtonGroup
          label="display mode"
          options={displayModeOptions}
          value={displayMode}
          onChange={onDisplayModeChange || (() => {})}
        />

        {/* Stats Display Setting */}
        <ButtonGroup
          label="stats display"
          options={statsDisplayOptions}
          value={statsDisplay}
          onChange={onStatsDisplayChange || (() => {})}
        />
      </div>
    </ModalBase>
  );
}

import type { SettingsModalProps, Theme, DisplayMode } from "../../../types";
import ModalBase from "./ModalBase";
import ButtonGroup from "../common/ButtonGroup";

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
  const themeOptions = themes.map((t) => ({ label: t, value: t }));
  const displayModeOptions: { label: string; value: DisplayMode }[] = [
    { label: "normal", value: "normal" },
    { label: "tape-word", value: "tape-word" },
    { label: "tape-char", value: "tape-char" },
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

      </div>
    </ModalBase>
  );
}

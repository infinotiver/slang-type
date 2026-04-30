import { THEMES, type SettingsModalProps } from "../../../types";
import ModalBase from "./ModalBase";
import ButtonGroup from "../common/ButtonGroup";

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const themeOptions = THEMES.map((t) => ({ label: t, value: t }));
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

        {/* Display Mode removed (tape modes deprecated) */}
      </div>
    </ModalBase>
  );
}

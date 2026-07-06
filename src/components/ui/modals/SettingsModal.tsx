import { THEMES, type SettingsModalProps } from "../../../types";
import ModalBase from "./ModalBase";
import ButtonGroup from "../common/ButtonGroup";
import { useState, useEffect } from "react";
export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}: SettingsModalProps) {
  const themeOptions = THEMES.map((t) => ({ label: t, value: t }));
  const STATS_OPTIONS = [
    { label: "default", value: "default" },
    {
      label: "bold",
      value: "bold",
    },
  ];

  const [statsDisplay, setStatsDisplay] = useState<string>(
    () => localStorage.getItem("slangtype_statsDisplay") || "default",
  );

  useEffect(() => {
    try {
      localStorage.setItem("slangtype_statsDisplay", statsDisplay);
    } catch {
      /* not a big fat issue - ignore */
    }
  }, [statsDisplay]);

  if (!isOpen) return null;
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

        <ButtonGroup
          label="stats display"
          options={STATS_OPTIONS}
          value={statsDisplay}
          onChange={(v) => setStatsDisplay(v)}
        />
      </div>
    </ModalBase>
  );
}

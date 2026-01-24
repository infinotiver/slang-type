import { useState } from "react";
import { TbSettings } from "react-icons/tb";
import SettingsModal from "./SettingsModal";
import type { Theme, DisplayMode, StatsDisplay } from "../../types";

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  statsDisplay: StatsDisplay;
  onStatsDisplayChange: (display: StatsDisplay) => void;
}
export default function Header({
  theme,
  onThemeChange,
  displayMode,
  onDisplayModeChange,
  statsDisplay,
  onStatsDisplayChange,
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="px-8 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-mono tracking-wider">
            <span className="text-highlight">slang</span>type{" "}
          </h1>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-foreground/70">best</span>
              <span className="text-highlight font-bold text-base">0</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-foreground hover:text-highlight transition-colors"
              aria-label="settings"
            >
              <TbSettings size={20} />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={onThemeChange}
        displayMode={displayMode}
        onDisplayModeChange={onDisplayModeChange}
        statsDisplay={statsDisplay}
        onStatsDisplayChange={onStatsDisplayChange}
      />
    </>
  );
}

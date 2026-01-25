import { useState } from "react";
import { TbHistory, TbSettings, TbInfoCircle } from "react-icons/tb";
import SettingsModal from "./SettingsModal";
import CreditsModal from "./CreditsModal";
import type { Theme, DisplayMode, StatsDisplay } from "../../types";
import { Link } from "react-router-dom";
interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  statsDisplay: StatsDisplay;
  onStatsDisplayChange: (display: StatsDisplay) => void;
  highScore: number;
  onHistoryClick?: () => void;
}
export default function Header({
  theme,
  onThemeChange,
  displayMode,
  onDisplayModeChange,
  statsDisplay,
  onStatsDisplayChange,
  highScore,
  onHistoryClick,
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  return (
    <>
      <header className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-lg sm:text-xl font-bold font-mono tracking-wider">
            <Link to="/">
              <span className="text-highlight">slang</span>type{" "}
            </Link>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-mono">
              <span className="text-foreground/70">best</span>
              <span className="text-highlight font-bold text-base">
                {highScore}
              </span>
            </div>
            <button
              onClick={onHistoryClick}
              className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95"
              aria-label="history"
              title="history"
            >
              <TbHistory size={20} />
            </button>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95"
              aria-label="credits"
              title="credits"
            >
              <TbInfoCircle size={20} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-foreground hover:text-highlight transition-colors active:scale-95"
              aria-label="settings"
              title="settings"
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
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </>
  );
}

import { useState } from "react";
import {
  TbArticleFilled,
  TbSettingsFilled,
  TbInfoCircleFilled,
} from "react-icons/tb";
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
      <header className="bg-background">
        <div className="px-8 sm:px-16 md:px-20 pt-1 sm:pt-2 md:pt-4">
          <div className="max-w-6xl mx-auto">
            {/* Top row: Logo and Right controls */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <Link to="/" className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-wide mb-2 text-highlight hover:text-accent">
                    slangtype
                  </h1>
                </Link>
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span className="text-foreground/60">best</span>
                  <span className="text-highlight font-bold">{highScore}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreditsOpen(true)}
                  className="p-1.5 rounded hover:bg-secondary/20 text-foreground hover:text-highlight transition-colors"
                  aria-label="credits"
                  title="info"
                >
                  <TbInfoCircleFilled size={18} />
                </button>
                <button
                  onClick={onHistoryClick}
                  className="p-1.5 rounded hover:bg-secondary/20 text-foreground hover:text-highlight transition-colors"
                  aria-label="history"
                  title="history"
                >
                  <TbArticleFilled size={18} />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded hover:bg-secondary/20 text-foreground hover:text-highlight transition-colors"
                  aria-label="settings"
                  title="settings"
                >
                  <TbSettingsFilled size={18} />
                </button>
              </div>
            </div>
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

import { useState } from "react";
import { Newspaper, Settings } from "lucide-react";
import { SettingsModal, CreditsModal } from "../modals";
import type { Theme, DisplayMode, StatsDisplay } from "../../../types";
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
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <Link to="/" className="flex items-center gap-2">
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <h1 className="text-xl font-bold tracking-tighter text-highlight lowercase">
                      slangtype
                    </h1>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span className="text-foreground/60">best</span>
                  <span className="text-highlight font-bold">{highScore}</span>
                </div>
                <button
                  onClick={onHistoryClick}
                  className="p-1.5 rounded hover:bg-secondary/20 text-foreground hover:text-highlight transition-colors"
                  aria-label="history"
                  title="history"
                >
                  <Newspaper size={20} />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded hover:bg-secondary/20 text-foreground hover:text-highlight transition-colors"
                  aria-label="settings"
                  title="settings"
                >
                  <Settings size={20} />
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
      {/* CreditsModal will be triggered from the footer now */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </>
  );
}

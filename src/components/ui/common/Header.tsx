import { useState } from "react";
import { SettingsModal } from "@components/ui/modals";
import type { Theme } from "@shared-types/index";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { Settings, Trophy, HistoryIcon } from "lucide-react";

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  highScore: number;
}

export default function Header({
  theme,
  onThemeChange,
  highScore,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-background pt-1 sm:pt-2 md:pt-4">
        <div className="mb-3 flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tighter text-highlight lowercase">
              slangtype
            </h1>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/30 px-3 py-2 text-sm font-mono text-foreground/80">
              <Trophy size={16} className="text-highlight" />
              <span>{highScore}</span>
            </div>

            <Button
              variant="secondary"
              className="group flex items-center gap-1 px-3 py-2"
              onClick={() => navigate("/history")}
              aria-label="history"
            >
              <HistoryIcon size={18} />
            </Button>

            <Button
              variant="secondary"
              className="group flex items-center gap-1 px-3 py-2"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="settings"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </>
  );
}

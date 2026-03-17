import { useState } from "react";
import UserDropdown from "./UserDropdown";
import { SettingsModal, CreditsModal } from "@components/ui/modals";
import type { Theme } from "@shared-types/index";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  return (
    <>
      <header className="bg-background">
        <div className="pt-1 sm:pt-2 md:pt-4">
          <div className="mx-auto">
            {/* Top row: Logo and Right controls */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <h1 className="text-2xl font-bold tracking-tighter text-highlight lowercase">
                    slangtype
                  </h1>
                </div>
              </Link>

              <div className="flex items-center gap-1 sm:gap-2">
                <UserDropdown
                  user={user}
                  highScore={highScore}
                  onSettingsOpen={() => setIsSettingsOpen(true)}
                />
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
      />
      {/* CreditsModal will be triggered from the footer now */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </>
  );
}

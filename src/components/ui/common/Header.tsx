import { useState } from "react";
import { SettingsModal, CreditsModal } from "@components/ui/modals";
import type { Theme } from "@shared-types/index";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Button from "./Button";
import { Settings, LogOutIcon, Trophy, LogIn, User } from "lucide-react";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="bg-background">
        <div className="pt-1 sm:pt-2 md:pt-4">
          <div className="mx-auto">
            {/* Top row: Logo and Right controls */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <h1 className="text-2xl font-bold tracking-tighter text-highlight lowercase">
                    slangtype
                  </h1>
                </div>
              </Link>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* High score display */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border border-secondary/40 bg-secondary/30 text-sm font-mono text-foreground/80">
                  <Trophy size={16} className="text-highlight" />
                  <span>{highScore}</span>
                </div>

                {/* Auth button */}
                <Button
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-2"
                  onClick={() => navigate(user ? "/profile" : "/login")}
                  aria-label={user ? "view profile" : "sign in"}
                >
                  {user ? <User size={18} /> : <LogIn size={18} />}
                  <span className="hidden sm:inline text-sm">
                    {user ? "profile" : "sign in"}
                  </span>
                </Button>

                {/* Settings button */}
                <Button
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-2 group"
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="settings"
                >
                  <Settings size={18} />
                </Button>

                {/* Logout button (only for authenticated users) */}
                {user && (
                  <Button
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-2"
                    onClick={handleLogout}
                    aria-label="log out"
                  >
                    <LogOutIcon size={18} />
                    <span className="hidden sm:inline text-sm">logout</span>
                  </Button>
                )}
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
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </>
  );
}

import { useState } from "react";
import { CircleUserIcon, Settings } from "lucide-react";
import { SettingsModal, CreditsModal } from "@components/ui/modals";
import type { Theme } from "@shared-types/index";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  const iconButtonMotion = {
    whileHover: { scale: 1.08 },
    whileTap: { scale: 0.96 },
  };

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
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span className="text-foreground/60">best</span>
                  <span className="text-highlight font-bold">{highScore}</span>
                </div>
                <div className="relative inline-flex group">
                  <Link
                    to={user ? "/profile" : "/login"}
                    className={`p-1.5 rounded hover:bg-secondary/20 transition-colors ${user ? "text-highlight" : "text-foreground/50 hover:text-highlight"}`}
                    aria-label={user ? "profile" : "login"}
                  >
                    <CircleUserIcon size={20} />
                  </Link>
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-secondary/40 bg-secondary px-2 py-1 text-[10px] text-foreground/85 shadow-md opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0">
                    {user ? (user.username ?? user.email) : "login"}
                  </span>
                 
                </div>
                <motion.button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded hover:bg-secondary/20 text-foreground/50 hover:text-highlight transition-colors"
                  aria-label="settings"
                  title="settings"
                  whileHover={iconButtonMotion.whileHover}
                  whileTap={iconButtonMotion.whileTap}
                >
                  <Settings size={20} />
                </motion.button>
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

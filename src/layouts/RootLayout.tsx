import {
  Outlet,
  ScrollRestoration,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@components/ui/common";
import useLocalStorage from "@hooks/useLocalStorage";
import type { Theme, DisplayMode } from "../types";
import { Analytics } from "@vercel/analytics/react";
import { CreditsModal, ChangelogModal } from "../components/ui/modals";
import changelog from "../../CHANGELOG.md?raw";
import { version as appVersion } from "../../package.json";
import { InfoIcon } from "lucide-react";

export default function RootLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useLocalStorage<Theme>("slangtype_theme", "dark");
  const [displayMode, setDisplayMode] = useLocalStorage<DisplayMode>(
    "slangtype_displayMode",
    "normal",
  );
  const [highScore] = useLocalStorage<number>("slangtype_highscore", 0);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono px-2 py-2 sm:px-10 md:px-12">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      {/* Header always visible */}
      <header>
        <Header
          theme={theme}
          onThemeChange={setTheme}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          highScore={highScore}
          onHistoryClick={() => navigate("/history")}
        />
      </header>
      {/* Page content */}
      <main id="main-content" className="flex-1">
        <Outlet context={{ displayMode }} />
      </main>
      <ScrollRestoration />
      <Analytics />
      {/* FOOTER - always visible */}
      <footer className="border-t border-secondary px-8 sm:px-16 md:px-20 py-1 sm:py-2 md:py-4">
        <div className="flex justify-between items-center gap-2 text-xs font-mono text-foreground/50">
          <button
            type="button"
            onClick={() => setIsChangelogOpen(true)}
            className="text-foreground/80 hover:text-highlight transition-colors font-semibold flex items-center gap-1 tracking-wide"
          >
            ver {appVersion}
          </button>
          <span className="flex items-center gap-1">
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="ml-1 p-1 rounded hover:bg-secondary/20 hover:text-highlight transition-colors"
              aria-label="credits"
              type="button"
            >
              <InfoIcon size={16} />
            </button>
          </span>
        </div>
        <CreditsModal
          isOpen={isCreditsOpen}
          onClose={() => setIsCreditsOpen(false)}
        />
        <ChangelogModal
          isOpen={isChangelogOpen}
          onClose={() => setIsChangelogOpen(false)}
          changelog={changelog}
          version={appVersion}
        />
      </footer>
    </div>
  );
}

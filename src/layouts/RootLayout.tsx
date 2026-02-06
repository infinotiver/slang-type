import { Outlet, ScrollRestoration, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "../components/ui/common";
import useLocalStorage from "../hooks/useLocalStorage";
import type { Theme, DisplayMode, StatsDisplay } from "../types";
import { Analytics } from "@vercel/analytics/react";
import { CreditsModal } from "../components/ui/modals";

export default function RootLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useLocalStorage<Theme>("slangtype_theme", "dark");
  const [displayMode, setDisplayMode] = useLocalStorage<DisplayMode>(
    "slangtype_displayMode",
    "normal",
  );
  const [statsDisplay, setStatsDisplay] = useLocalStorage<StatsDisplay>(
    "slangtype_statsDisplay",
    "normal",
  );
  const [highScore] = useLocalStorage<number>("slangtype_highscore", 0);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono px-2 py-4 sm:px-16 md:px-20">
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
          statsDisplay={statsDisplay}
          onStatsDisplayChange={setStatsDisplay}
          highScore={highScore}
          onHistoryClick={() => navigate("/history")}
        />
      </header>
      {/* Page content */}
      <main id="main-content" className="flex-1">
        <Outlet context={{ displayMode, statsDisplay }} />
      </main>
      <ScrollRestoration />
      <Analytics />
      {/* FOOTER - always visible */}
      <footer className="border-t border-secondary/40 px-8 sm:px-16 md:px-20 py-3 sm:py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-foreground/50">
          <span>alpha</span>
          <span className="flex items-center gap-1">
            made with love by
            <a
              href="https://github.com/infinotiver"
              className="hover:text-highlight transition-colors"
            >
              infinotiver
            </a>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="ml-1 p-1 rounded hover:bg-secondary/20 text-foreground hover:text-highlight transition-colors"
              aria-label="credits"
              type="button"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-7h2v5h-2v-5zm0-4h2v2h-2V9z" />
              </svg>
            </button>
          </span>
        </div>
        <CreditsModal
          isOpen={isCreditsOpen}
          onClose={() => setIsCreditsOpen(false)}
        />
      </footer>
    </div>
  );
}

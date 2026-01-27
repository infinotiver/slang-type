import { Outlet, ScrollRestoration, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/ui/Header";
import useLocalStorage from "../hooks/useLocalStorage";
import type { Theme, DisplayMode, StatsDisplay } from "../types";

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

  // Apply theme to document
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono px-2 py-4 sm:p-16 md:p-20">
      {/* Header always visible */}
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
      {/* Page content */}
      <Outlet context={{ displayMode, statsDisplay }} />
      <ScrollRestoration />
      {/* FOOTER - always visible */}
      <footer className="border-t border-secondary/40 px-8 sm:px-16 md:px-20 py-3 sm:py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-foreground/50">
          <span>alpha</span>
          <span>
            made with love by{" "}
            <a
              href="https://github.com/infinotiver"
              className="hover:text-highlight transition-colors"
            >
              infinotiver
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

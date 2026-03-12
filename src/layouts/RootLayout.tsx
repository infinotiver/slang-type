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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      <div className="flex-1 flex flex-col">
        {/* Header always visible */}
        <header className="px-2 ">
          <div className="max-w-5xl mx-auto w-full">
            <Header
              theme={theme}
              onThemeChange={setTheme}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              highScore={highScore}
              onHistoryClick={() => navigate("/history")}
            />
          </div>
        </header>
        {/* Page content */}
        <main id="main-content" className="flex-1 px-2 py-2">
          <div className="max-w-5xl mx-auto w-full h-full">
            <Outlet context={{ displayMode }} />
          </div>
        </main>
      </div>
      <ScrollRestoration />
      <Analytics />
      {/* FOOTER - always visible */}
      <footer className="py-2 sm:py-4">
        <div className="px-2">
          <div className="max-w-5xl mx-auto w-full">
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
          </div>
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

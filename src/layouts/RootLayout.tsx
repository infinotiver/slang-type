import { Outlet, ScrollRestoration } from "react-router-dom";
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
  const [theme, setTheme] = useLocalStorage<Theme>("slangtype_theme", "dark");
  const [displayMode] = useLocalStorage<DisplayMode>(
    "slangtype_displayMode",
    "normal",
  );
  const [highScore] = useLocalStorage<number>("slangtype_highscore", 0);

  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-mono overflow-hidden">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      {/* Header */}
      <header className="w-full px-4 sm:px-8 md:px-12">
        <Header theme={theme} onThemeChange={setTheme} highScore={highScore} />
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 min-h-0 flex px-2">
        <Outlet context={{ displayMode }} />
      </main>

      {/* Footer */}
      <footer className="py-4 sm:py-6">
        <div className="w-full px-4 sm:px-8 md:px-12">
          <div className="flex items-center justify-between gap-2 text-xs font-mono text-foreground/50">
            <button
              type="button"
              onClick={() => setIsChangelogOpen(true)}
              className="flex items-center gap-1 font-semibold tracking-wide text-foreground/80 transition-colors hover:text-highlight"
            >
              ver {appVersion}
            </button>

            <button
              type="button"
              aria-label="credits"
              onClick={() => setIsCreditsOpen(true)}
              className="rounded p-1 transition-colors hover:bg-secondary/20 hover:text-highlight"
            >
              <InfoIcon size={16} />
            </button>
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

      <ScrollRestoration />
      <Analytics />
    </div>
  );
}

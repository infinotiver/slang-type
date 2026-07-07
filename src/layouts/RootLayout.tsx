import { Outlet, ScrollRestoration } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Header } from "@components/ui/common";
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

  const footerActionGroup =
    "inline-flex items-stretch overflow-hidden rounded-full border border-secondary bg-secondary";
  const footerActionButton =
    "rounded-none border-0 px-3 py-2 text-xs font-mono text-foreground";
  const pageFrame = "w-full max-w-6xl py-2 mx-auto px-4 sm:px-8 md:px-12";

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-mono overflow-hidden">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      {/* Header */}
      <div className={pageFrame}>
        <Header theme={theme} onThemeChange={setTheme} highScore={highScore} />
      </div>

      {/* Main */}
      <main id="main-content" className="flex-1 min-h-0 flex">
        <div className={`${pageFrame} h-full flex flex-col`}>
          <Outlet context={{ displayMode }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 sm:py-4">
        <div className={pageFrame}>
          <div className="flex items-center justify-between gap-1 text-xs font-mono text-foreground/50">
            <div className={footerActionGroup}>
              <Button
                variant="secondary"
                className={footerActionButton}
                onClick={() => setIsChangelogOpen(true)}
              >
                v{appVersion}
              </Button>

              <Button
                aria-label="credits"
                variant="secondary"
                className={footerActionButton}
                onClick={() => setIsCreditsOpen(true)}
              >
                <InfoIcon size={18} className="text-foreground/50" />
              </Button>
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

      <ScrollRestoration />
      <Analytics />
    </div>
  );
}

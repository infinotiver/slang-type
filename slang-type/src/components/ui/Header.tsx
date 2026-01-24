import { useState } from "react";
import { TbSettings } from "react-icons/tb";
import SettingsModal from "./SettingsModal";
import type { Theme, DisplayMode } from "../../types";
interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}
export default function Header({
  theme,
  onThemeChange,
  displayMode,
  onDisplayModeChange,
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="px-12 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-mono tracking-wider">
            <span className="text-highlight">slang</span>type{" "}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center text-md space-x-2">
              <div className="text-foreground flex items-center justify-center space-x-1">
                best
              </div>
              <div className="text-highlight font-bold">0</div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-foreground hover:text-accent transition-colors flex items-center justify-center"
            >
              <TbSettings size={20} />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={onThemeChange}
        displayMode={displayMode}
        onDisplayModeChange={onDisplayModeChange}
      />
    </>
  );
}

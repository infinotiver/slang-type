import { useState, useMemo, useEffect } from "react";
import "./index.css";
import Header from "./components/ui/Header";
import StatsAndControls from "./components/ui/StatsAndControls";
import TypingArea from "./components/typing/TypingArea";
import { generatePhrase } from "./utils/textGenerator";
import type { Language, Mode, Theme, DisplayMode } from "./types";
import useTypingEngine from "./hooks/useTypingEngine";
import useTimer from "./hooks/useTimer";

function App() {
  const [language, setLanguage] = useState<Language>("slang");
  const [mode, setMode] = useState<Mode>("30s");
  const [theme, setTheme] = useState<Theme>("dark");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal");

  // Generate passage text based on language and mode
  const passageText = useMemo(() => {
    if (language === "code") return "";
    // For inf mode, generate exactly 50 words; for timed modes, calculate based on WPM (100 words per 15 seconds)
    const targetWords =
      mode === "inf"
        ? 50
        : Math.ceil((Number(mode.replace("s", "")) / 15) * 100);
    return generatePhrase(language, targetWords);
  }, [language, mode]);

  // Apply theme to document
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Initialize timer with duration based on mode
  const durationSeconds = mode === "inf" ? null : Number(mode.replace("s", ""));
  const timer = useTimer({ duration: durationSeconds });

  // Initialize typing engine
  const engine = useTypingEngine({
    targetText: passageText,
    timer,
    mode: mode === "inf" ? "inf" : "timed",
  });

  // Handle language change and stop test
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as Language);
    engine.stop(); // Stop current test
    engine.reset();
  };

  // Handle mode change and stop test
  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode);
    engine.stop(); // Stop current test
    engine.reset();
    if (newMode === "inf" && language === "slang") {
      setLanguage("english");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      {/* STATS & CONTROLS */}
      <div className="px-12 py-2 flex justify-center items-center">
        <StatsAndControls
          wpm={engine.wpm}
          accuracy={engine.accuracy}
          language={language}
          mode={mode}
          slangDisabled={mode === "inf"}
          onLanguageChange={handleLanguageChange}
          onModeChange={handleModeChange}
          elapsed={engine.elapsed}
          duration={durationSeconds || 0}
        />
      </div>

      {/* TYPING AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-12 py-4">
        <TypingArea
          targetText={passageText}
          engine={engine}
          timer={timer}
          displayMode={displayMode}
        />
      </main>
    </div>
  );
}

export default App;

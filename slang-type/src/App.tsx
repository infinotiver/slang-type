import { useState, useMemo, useEffect } from "react";
import "./index.css";
import Header from "./components/ui/Header";
import StatsAndControls from "./components/ui/StatsAndControls";
import TypingArea from "./components/typing/TypingArea";
import { generatePhrase } from "./utils/textGenerator";
import type {
  Language,
  Mode,
  Theme,
  DisplayMode,
  StatsDisplay,
  TypingAttempt,
} from "./types";
import useTypingEngine from "./hooks/useTypingEngine";
import useTimer from "./hooks/useTimer";
import useLocalStorage from "./hooks/useLocalStorage";

function App() {
  const [language, setLanguage] = useState<Language>("slang");
  const [mode, setMode] = useState<Mode>("30s");
  const [theme, setTheme] = useState<Theme>("dark");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal");
  const [statsDisplay, setStatsDisplay] = useState<StatsDisplay>("normal");

  // Initialize localStorage for high score and attempts
  const [highScore, setHighScore] = useLocalStorage<number>(
    "slangtype_highscore",
    0,
  );
  const [attempts, setAttempts] = useLocalStorage<TypingAttempt[]>(
    "slangtype_attempts",
    [],
  );

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
        statsDisplay={statsDisplay}
        onStatsDisplayChange={setStatsDisplay}
        highScore={highScore}
        attempts={attempts}
      />

      {/* STATS & CONTROLS */}
      <div className="px-4 sm:px-8 md:px-12 py-2 flex justify-center items-center">
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
          display={statsDisplay}
        />
      </div>

      {/* TYPING AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 py-2">
        <TypingArea
          targetText={passageText}
          engine={engine}
          timer={timer}
          displayMode={displayMode}
          mode={mode}
          language={language}
          highScore={highScore}
          onAttemptComplete={(attempt) => {
            // Update high score
            if (attempt.wpm > highScore) {
              setHighScore(attempt.wpm);
            }
            // Save attempt to history
            setAttempts([...attempts, attempt]);
          }}
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-secondary/40 px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-foreground/50">
          <span>slangtype</span>
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

export default App;

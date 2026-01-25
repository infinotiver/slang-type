import { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import StatsAndControls from "../ui/StatsAndControls";
import TypingArea from "../typing/TypingArea";
import { generatePhrase } from "../../utils/textGenerator";
import type { Language, Mode, StatsDisplay, DisplayMode } from "../../types";
import useTypingEngine from "../../hooks/useTypingEngine";
import useTimer from "../../hooks/useTimer";
import useLocalStorage from "../../hooks/useLocalStorage";

interface ContextType {
  displayMode: DisplayMode;
  statsDisplay: StatsDisplay;
}

interface ResultsPayload {
  wpm: number;
  accuracy: number;
  errors: number;
  elapsed: number;
  totalTyped: number;
  correctChars: number;
  charStatus: Record<number, "pending" | "correct" | "incorrect">;
  targetText: string;
  mode: Mode;
  language: Language;
  isNewHighScore: boolean;
  isBaseline: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const context = useOutletContext<ContextType>();

  const [language, setLanguage] = useState<Language>("slang");
  const [mode, setMode] = useState<Mode>("30s");

  // Get high score from localStorage
  const [highScore, setHighScore] = useLocalStorage<number>(
    "slangtype_highscore",
    0,
  );

  // Generate passage text based on language and mode
  const passageText = useMemo(() => {
    if (language === "code") return "";
    const targetWords =
      mode === "inf"
        ? 50
        : Math.ceil((Number(mode.replace("s", "")) / 15) * 100);
    return generatePhrase(language, targetWords);
  }, [language, mode]);

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
    engine.stop();
    engine.reset();
  };

  // Handle mode change and stop test
  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode);
    engine.stop();
    engine.reset();
  };

  return (
    <>
      {/* STATS & CONTROLS */}
      <div className="px-4 sm:px-8 md:px-12 py-2 flex justify-center items-center">
        <StatsAndControls
          wpm={engine.wpm}
          accuracy={engine.accuracy}
          language={language}
          mode={mode}
          slangDisabled={false}
          onLanguageChange={handleLanguageChange}
          onModeChange={handleModeChange}
          elapsed={engine.elapsed}
          duration={durationSeconds || 0}
          display={context.statsDisplay}
        />
      </div>

      {/* TYPING AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 py-2">
        <TypingArea
          targetText={passageText}
          engine={engine}
          timer={timer}
          displayMode={context.displayMode}
          mode={mode}
          language={language}
          highScore={highScore}
          onResultsComplete={(resultsPayload: ResultsPayload) => {
            // Update high score if needed
            if (resultsPayload.wpm > highScore) {
              setHighScore(resultsPayload.wpm);
            }
            // Navigate to results page with state
            navigate("/results", {
              state: {
                results: resultsPayload,
                highScore: Math.max(highScore, resultsPayload.wpm),
              },
            });
          }}
        />
      </main>
    </>
  );
}

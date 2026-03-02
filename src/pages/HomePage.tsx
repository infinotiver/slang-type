import { useState, useMemo, useRef, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { TypingStatusBar } from "@components/ui/stats";
import TypingArea from "@components/typing/TypingArea";
import { generatePhrase } from "@utils/textGenerator";
import type {
  Language,
  Mode,
  DisplayMode,
} from "@shared-types/index";
import useTypingEngine from "@hooks/useTypingEngine";
import useTimer from "@hooks/useTimer";
import useLocalStorage from "@hooks/useLocalStorage";

interface ContextType {
  displayMode: DisplayMode;
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

  // Ref to store pending results for high score update
  const pendingResultsRef = useRef<ResultsPayload | null>(null);

  // Handle high score update after navigation
  useEffect(() => {
    if (pendingResultsRef.current) {
      const results = pendingResultsRef.current;
      if (results.wpm > highScore) {
        setHighScore(results.wpm);
      }
      pendingResultsRef.current = null;
    }
  }, [highScore, setHighScore]);

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
      <div className="px-8 sm:px-16 md:px-20 py-1 sm:py-2 md:py-3 flex justify-center items-center">
        <TypingStatusBar
          wpm={engine.wpm}
          accuracy={engine.accuracy}
          language={language}
          mode={mode}
          slangDisabled={false}
          onLanguageChange={handleLanguageChange}
          onModeChange={handleModeChange}
          elapsed={engine.elapsed}
          duration={durationSeconds || 0}
          isTypingRunning={engine.running}
        />
      </div>

      {/* TYPING AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 sm:px-16 md:px-20 py-2 sm:py-3 md:py-4">
        <TypingArea
          targetText={passageText}
          engine={engine}
          timer={timer}
          displayMode={context.displayMode}
          mode={mode}
          language={language}
          highScore={highScore}
          onResultsComplete={(resultsPayload: ResultsPayload) => {
            // Store results for high score update after navigation
            pendingResultsRef.current = resultsPayload;
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

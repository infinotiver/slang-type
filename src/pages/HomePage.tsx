import { useState, useRef, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { TypingBar } from "@components/ui/stats";
import TypingArea from "@components/typing/TypingArea";
import AIWordsModal from "@components/ui/modals/AIWordsModal";
import { generatePhrase } from "@utils/textGenerator";
import { getTargetWordsForMode } from "@utils/mode";
import type {
  Language,
  Mode,
  OutletContext,
  ResultsPayload,
} from "@shared-types/index";
import useTypingEngine from "@hooks/useTypingEngine";
import useTimer from "@hooks/useTimer";
import useLocalStorage from "@hooks/useLocalStorage";
import { createGeminiService } from "@/services/geminiService";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const context = useOutletContext<OutletContext>();

  const [language, setLanguage] = useState<Language>("slang");
  const [mode, setMode] = useState<Mode>("30s");
  const [customPassageText, setCustomPassageText] = useState<string | null>(
    null,
  );
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const geminiService = useMemo(() => createGeminiService(), []);

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

  const targetWords = getTargetWordsForMode(mode);

  // Generate passage text based on language and mode
  const generatedPassageText = useMemo(() => {
    return generatePhrase(language, targetWords);
  }, [language, targetWords]);

  const passageText = customPassageText ?? generatedPassageText;

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
    setCustomPassageText(null);
    engine.stop();
    engine.reset();
  };

  // Handle mode change and stop test
  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode);
    setCustomPassageText(null);
    engine.stop();
    engine.reset();
  };

  const handleAIWordsGenerated = (words: string[]) => {
    const newText = words.join(" ");
    setCustomPassageText(newText);
    engine.stop();
    engine.reset();
    setIsAIModalOpen(false);
  };

  return (
    <>
      {/* STATS & CONTROLS */}
      <div className="py-1 sm:py-2 md:py-3 flex justify-center items-center">
        <TypingBar
          wpm={engine.wpm}
          accuracy={engine.accuracy}
          language={language}
          mode={mode}
          slangDisabled={false}
          onLanguageChange={handleLanguageChange}
          onModeChange={handleModeChange}
          onRequestAIWords={() => {
            if (!user) {
              navigate("/login");
              return;
            }
            setIsAIModalOpen(true);
          }}
          elapsed={engine.elapsed}
          duration={durationSeconds || 0}
          isTypingRunning={engine.running}
        />
      </div>

      {/* TYPING AREA */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 md:py-4">
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

      {/* AI Words Modal */}
      <AIWordsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onWordsGenerated={handleAIWordsGenerated}
        geminiService={geminiService}
        mode={mode}
        targetWordCount={targetWords}
      />
    </>
  );
}

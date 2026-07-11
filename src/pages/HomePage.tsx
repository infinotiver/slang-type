import { useState, useRef, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Button } from "@components/ui/common";
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

export default function HomePage() {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();

  const [language, setLanguage] = useState<Language>("slang");
  const [mode, setMode] = useState<Mode>("30s");
  const [customPassageText, setCustomPassageText] = useState<string | null>(
    null,
  );
  const [aiGenerated, setAiGenerated] = useState(false);
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
  const isAIMode = language === "ai";
  const aiWordsReady = Boolean(customPassageText?.trim());

  // Generate passage text based on language and mode
  const generatedPassageText = useMemo(() => {
    if (isAIMode) {
      return "";
    }
    return generatePhrase(language, targetWords);
  }, [language, targetWords, isAIMode]);

  const passageText = isAIMode
    ? (customPassageText ?? "")
    : (customPassageText ?? generatedPassageText);

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
    setAiGenerated(false);
    engine.stop();
    engine.reset();
  };

  // Handle mode change and stop test
  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode);
    setCustomPassageText(null);
    setAiGenerated(false);
    engine.stop();
    engine.reset();
  };

  const handleAIWordsGenerated = (words: string[]) => {
    const newText = words.join(" ");
    setCustomPassageText(newText);
    setAiGenerated(true);
    engine.stop();
    engine.reset();
    setIsAIModalOpen(false);
  };

  const openAIModal = () => {
    setIsAIModalOpen(true);
  };

  // Automatically open AI modal when AI mode is selected and no words are ready
  useEffect(() => {
    if (isAIMode && !aiWordsReady) {
      setTimeout(() => setIsAIModalOpen(true), 0);
    }
  }, [isAIMode, aiWordsReady]);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-2 md:justify-center md:gap-8">
      <section className="flex shrink-0 justify-center">
        <TypingBar
          wpm={engine.wpm}
          accuracy={engine.accuracy}
          language={language}
          mode={mode}
          onLanguageChange={handleLanguageChange}
          onModeChange={handleModeChange}
          onRequestAIWords={openAIModal}
          elapsed={engine.elapsed}
          duration={durationSeconds || 0}
          isTypingRunning={engine.running}
        />
      </section>

      {/* TYPING AREA */}
      <section className="flex min-h-0 flex-1 w-full flex-col items-center justify-start md:justify-center">
        {isAIMode && !aiWordsReady ? (
          <div className="my-auto flex h-full w-full max-w-3xl flex-col items-center justify-center space-y-3 px-4 text-center">
            <p className="text-xs">
              ai mode requires you to enter a prompt to generate test words. ai
              mode uses external llm api
            </p>
            <Button onClick={openAIModal}>Generate with AI</Button>
          </div>
        ) : (
          <TypingArea
            targetText={passageText}
            engine={engine}
            timer={timer}
            displayMode={context.displayMode}
            mode={mode}
            language={language}
            highScore={highScore}
            aiGenerated={aiGenerated}
            onResultsComplete={(resultsPayload: ResultsPayload) => {
              pendingResultsRef.current = resultsPayload;

              navigate("/results", {
                state: {
                  results: resultsPayload,
                  highScore: Math.max(highScore, resultsPayload.wpm),
                },
              });
            }}
          />
        )}
      </section>

      {/* AI Words Modal */}
      <AIWordsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onWordsGenerated={handleAIWordsGenerated}
        geminiService={geminiService}
        mode={mode}
        targetWordCount={targetWords}
      />
    </div>
  );
}

import { useRef, useEffect, useMemo, useLayoutEffect, Fragment } from "react";
import type {
  Mode,
  Language,
  DisplayMode,
  ResultsPayload,
} from "@shared-types/index";
import { Button } from "@components/ui/common";
import { motion, AnimatePresence } from "framer-motion";

// --- Interfaces ---

interface Engine {
  cursor: number;
  status: Record<number, "pending" | "correct" | "incorrect">;
  errors: number;
  running: boolean;
  paused: boolean;
  elapsed: number;
  isComplete: boolean;
  wpm: number;
  accuracy: number;
  totalTyped: number;
  correctChars: number;
  handleKey: (e: { key: string }) => void; // Simplified for both real events and synthetic ones
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

interface Char {
  char: string;
  index: number;
}

interface Word {
  chars: Char[];
  spaceIndex: number | null;
}

interface TypingAreaProps {
  targetText: string;
  engine: Engine;
  mode: Mode;
  language: Language;
  highScore: number;
  aiGenerated?: boolean;
  onResultsComplete?: (results: ResultsPayload) => void;
  // Optional/unused props kept for structural integrity
  timer?: {
    running: boolean;
    elapsed: number;
    start: () => void;
    stop: () => void;
    reset: () => void;
    resume: () => void;
    expired?: boolean;
  };
  displayMode?: DisplayMode;
}

// --- Component ---

export default function TypingArea({
  targetText,
  engine,
  mode,
  language,
  highScore,
  aiGenerated = false,
  onResultsComplete,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const completionHandledRef = useRef(false);

  // 1. Memoize text processing
  const words = useMemo((): Word[] => {
    let charIndex = 0;
    return targetText.split(" ").map((word, i, arr) => {
      const chars = word.split("").map((char) => ({
        char,
        index: charIndex++,
      }));
      const spaceIndex = i < arr.length - 1 ? charIndex++ : null;
      return { chars, spaceIndex };
    });
  }, [targetText]);

  // 2. Browser-native scrolling
  useLayoutEffect(() => {
    const active = activeCharRef.current;
    const container = scrollContainerRef.current;
    if (!active || !container) return;

    const activeRect = active.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const isAbove = activeRect.top < containerRect.top + 32;
    const isBelow = activeRect.bottom > containerRect.bottom - 32;

    if (isAbove || isBelow) {
      container.scrollTo({
        top:
          container.scrollTop +
          (activeRect.top - containerRect.top) -
          container.clientHeight / 2 +
          active.clientHeight / 2,
        behavior: "smooth",
      });
    }
  }, [engine.cursor]);

  // 3. Input focus management
  useEffect(() => {
    if (!engine.isComplete && !engine.paused) {
      inputRef.current?.focus();
    }
  }, [engine.isComplete, engine.paused]);

  // 4. Completion logic
  useEffect(() => {
    if (!engine.isComplete || completionHandledRef.current) return;

    completionHandledRef.current = true;
    onResultsComplete?.({
      id: crypto.randomUUID(), // More robust ID generation
      wpm: engine.wpm,
      accuracy: engine.accuracy,
      errors: engine.errors,
      elapsed: engine.elapsed,
      totalTyped: engine.totalTyped,
      correctChars: engine.correctChars,
      charStatus: { ...engine.status },
      targetText,
      mode,
      language,
      isNewHighScore: engine.wpm > highScore,
      isBaseline: highScore === 0,
      aiGenerated,
    });
  }, [
    engine,
    engine.isComplete,
    highScore,
    language,
    mode,
    aiGenerated,
    onResultsComplete,
    targetText,
  ]);

  const renderChar = (char: string, idx: number) => {
    const status = engine.status[idx];
    const isCurrent = idx === engine.cursor;

    let color = "text-foreground/30";
    if (status === "correct") color = "text-highlight";
    if (status === "incorrect") color = "text-red-500";

    return (
      <span
        key={idx}
        ref={isCurrent ? activeCharRef : null}
        className={`${color} whitespace-pre transition-colors duration-75 ${
          isCurrent ? "bg-secondary border-b-2 border-highlight" : ""
        }`}
      >
        {char}
      </span>
    );
  };

  const showStartOrResumeOverlay =
    engine.paused || (!engine.running && engine.cursor === 0);

  if (engine.isComplete) return null;

  return (
    <Fragment>
      <input
        ref={inputRef}
        type="text"
        // Handle special keys like Backspace
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Escape") {
            engine.handleKey(e);
          }
        }}
        // Handle character input
        onChange={(e) => {
          const val = e.target.value;
          if (val.length > 0) {
            engine.handleKey({ key: val[val.length - 1] });
            e.target.value = ""; // Reset for next char
          }
        }}
        onBlur={() => engine.running && !engine.paused && engine.pause()}
        onFocus={() => engine.paused && engine.cursor > 0 && engine.resume()}
        className="fixed opacity-0 pointer-events-none"
        autoFocus
      />

      <div className="w-full mx-auto flex flex-col items-center">
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={() => inputRef.current?.focus()}
        >
          {aiGenerated && (
            <div className="absolute right-2 top-2 z-30">
              <span className="px-3 py-1 text-xs uppercase rounded-md bg-highlight/15 text-highlight border border-highlight/10">
                AI generated
              </span>
            </div>
          )}
          <div
            ref={scrollContainerRef}
            className="h-50 overflow-hidden p-2 sm:p-4 scroll-smooth"
          >
            <div className="flex flex-wrap text-4xl font-mono leading-[1.8] text-justify">
              {words.map((w, wordIdx) => (
                <span key={wordIdx} className="inline-block mr-[0.25em]">
                  {w.chars.map((c) => renderChar(c.char, c.index))}
                  {w.spaceIndex !== null && renderChar(" ", w.spaceIndex)}
                </span>
              ))}
            </div>
          </div>

          {/* Overlay - Start or Resume */}
          <AnimatePresence>
            {showStartOrResumeOverlay && (
              <motion.div
                className="absolute inset-0 z-20 bg-background/80 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Button
                    onClick={() =>
                      engine.cursor > 0 ? engine.resume() : engine.start()
                    }
                  >
                    {engine.cursor > 0 ? "Resume" : "Start typing"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Debug Stats */}
        {import.meta.env.MODE === "development" && engine.running && (
          <div className="mt-12 text-xs text-foreground font-mono opacity-60 space-y-1 text-center tracking-wide">
            <div>
              wpm: {engine.wpm} | acc: {Math.round(engine.accuracy)}% | errors:{" "}
              {engine.errors}
            </div>
            <div>
              cursor: {engine.cursor} | typed: {engine.totalTyped} | elapsed:{" "}
              {engine.elapsed}s
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

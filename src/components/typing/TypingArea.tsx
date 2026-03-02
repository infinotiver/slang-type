import { useRef, useMemo, useLayoutEffect, useState, useEffect } from "react";
import { Button } from "@components/ui/common";
import type { DisplayMode, Mode, Language } from "@shared-types/index";
import { motion } from "framer-motion";

const buildLineStarts = (text: string, lineLength: number): number[] => {
  if (!text) return [0];
  const starts = [0];
  let cursor = 0;
  let currentLineLength = 0;

  while (cursor < text.length) {
    const nextSpace = text.indexOf(" ", cursor);
    const wordEnd = nextSpace === -1 ? text.length : nextSpace;
    const wordLength = wordEnd - cursor;
    const hasSpace = wordEnd < text.length;
    const addition = wordLength + (hasSpace ? 1 : 0);

    if (currentLineLength > 0 && currentLineLength + addition > lineLength) {
      starts.push(cursor);
      currentLineLength = 0;
    }

    currentLineLength += addition;
    cursor = wordEnd + (hasSpace ? 1 : 0);
  }

  return starts;
};

interface UseTypingEngineReturn {
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
  handleKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
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

interface TypingAreaProps {
  targetText: string;
  engine: UseTypingEngineReturn;
  displayMode: DisplayMode;
  mode: Mode;
  language: Language;
  highScore: number;
  onResultsComplete?: (results: ResultsPayload) => void;
  timer?: {
    running: boolean;
    elapsed: number;
    start: () => void;
    stop: () => void;
    reset: () => void;
    resume: () => void;
    expired: boolean;
  };
}

export default function TypingArea({
  targetText,
  engine,
  displayMode,
  mode,
  language,
  highScore,
  onResultsComplete,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const normalContainerRef = useRef<HTMLDivElement>(null);
  const normalMeasureRef = useRef<HTMLSpanElement>(null);
  const completionHandledRef = useRef(false);

  // TAPE MODES: Calculate word/char positions
  const words = useMemo(() => targetText.split(" "), [targetText]);
  const wordPositions = useMemo(() => {
    const positions = [];
    let charPos = 0;
    for (const word of words) {
      positions.push(charPos);
      charPos += word.length + 1; // +1 for space
    }
    return positions;
  }, [words]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const DEFAULT_LINE_LENGTH = isMobile ? 40 : 80;
  const DEFAULT_VISIBLE_LINES = isMobile ? 2 : 3;
  const [normalLineLength, setNormalLineLength] =
    useState<number>(DEFAULT_LINE_LENGTH);
  const [normalVisibleLines, setNormalVisibleLines] = useState<number>(
    DEFAULT_VISIBLE_LINES,
  );

  useEffect(() => {
    if (!engine.isComplete && !engine.paused) {
      inputRef.current?.focus();
    }
  }, [engine.isComplete, engine.paused, targetText]);

  useLayoutEffect(() => {
    if (displayMode !== "normal") return;

    const container = normalContainerRef.current;
    const measure = normalMeasureRef.current;
    if (!container || !measure) return;

    const updateSizing = () => {
      const containerWidth = container.clientWidth;
      const sampleWidth = measure.getBoundingClientRect().width;
      const charWidth =
        sampleWidth > 0 ? sampleWidth / measure.textContent!.length : 0;

      const computed = window.getComputedStyle(container);
      let lineHeight = parseFloat(computed.lineHeight);
      if (Number.isNaN(lineHeight)) {
        const fontSize = parseFloat(computed.fontSize) || 16;
        lineHeight = fontSize * 1.4;
      }

      const targetHeight = window.innerHeight * (isMobile ? 0.26 : 0.34);
      const maxLines = isMobile ? 4 : 8;
      const nextVisibleLines = Math.max(
        DEFAULT_VISIBLE_LINES,
        Math.min(maxLines, Math.floor(targetHeight / lineHeight)),
      );

      const nextLineLength =
        charWidth > 0
          ? Math.max(
              DEFAULT_LINE_LENGTH,
              Math.floor(containerWidth / charWidth),
            )
          : DEFAULT_LINE_LENGTH;

      setNormalVisibleLines((prev) =>
        prev === nextVisibleLines ? prev : nextVisibleLines,
      );
      setNormalLineLength((prev) =>
        prev === nextLineLength ? prev : nextLineLength,
      );
    };

    updateSizing();
    const onResize = () => updateSizing();
    window.addEventListener("resize", onResize);

    const observer = new ResizeObserver(updateSizing);
    observer.observe(container);

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [displayMode, isMobile, DEFAULT_LINE_LENGTH, DEFAULT_VISIBLE_LINES]);
  const lineStarts = useMemo(
    () => buildLineStarts(targetText, normalLineLength),
    [targetText, normalLineLength],
  );
  const totalLines = lineStarts.length;
  const clampedCursor = Math.min(engine.cursor, targetText.length);
  let cursorLine = totalLines - 1;
  for (let i = 0; i < totalLines; i++) {
    const nextLineStart =
      i + 1 < totalLines ? lineStarts[i + 1] : targetText.length;
    if (clampedCursor >= lineStarts[i] && clampedCursor < nextLineStart) {
      cursorLine = i;
      break;
    }
  }
  const maxStartLine = Math.max(0, totalLines - normalVisibleLines);
  const baseStartLine = Math.max(0, cursorLine - (normalVisibleLines - 1));
  const windowStartLine = Math.min(baseStartLine, maxStartLine);
  const windowEndLine = Math.min(
    totalLines,
    windowStartLine + normalVisibleLines,
  );
  const normalTextStart = lineStarts[windowStartLine];
  const normalTextEnd =
    windowEndLine < totalLines ? lineStarts[windowEndLine] : targetText.length;
  const visibleNormalText = targetText.substring(
    normalTextStart,
    normalTextEnd,
  );

  // Find current word index based on cursor position
  const currentWordIdx = useMemo(() => {
    for (let i = wordPositions.length - 1; i >= 0; i--) {
      if (engine.cursor >= wordPositions[i]) {
        return i;
      }
    }
    return 0;
  }, [engine.cursor, wordPositions]);

  // Calculate visible words for tape-word mode (show context: 4 before, current, 4 after)
  const TAPE_WORD_CONTEXT = 4;
  const tapeWordStart = Math.max(0, currentWordIdx - TAPE_WORD_CONTEXT);
  const tapeWordEnd = Math.min(
    words.length,
    currentWordIdx + TAPE_WORD_CONTEXT + 1,
  );
  const visibleWords = words.slice(tapeWordStart, tapeWordEnd);

  // Calculate visible characters for tape-char mode (show 120 char window centered on cursor)
  const TAPE_CHAR_WINDOW = 120;
  const tapeCharStart = Math.max(
    0,
    engine.cursor - Math.floor(TAPE_CHAR_WINDOW / 2),
  );
  const tapeCharEnd = Math.min(
    targetText.length,
    tapeCharStart + TAPE_CHAR_WINDOW,
  );
  const tapeCharText = targetText.substring(tapeCharStart, tapeCharEnd);

  // Handle starting the test
  const handleStartClick = () => {
    if (engine.paused) {
      engine.resume();
    } else {
      engine.start();
    }
    inputRef.current?.focus();
  };

  // Handle special keys (Backspace, Escape) that don't trigger onChange
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" || e.key === "Escape") {
      engine.handleKey(e);
    }
  };

  // Handle keyboard input via onChange for better mobile support
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;

    const char = value[value.length - 1];
    const syntheticEvent = new KeyboardEvent("keydown", {
      key: char,
    }) as unknown as React.KeyboardEvent<HTMLInputElement>;
    engine.handleKey(syntheticEvent);
    e.target.value = "";
  };

  // Pause on blur
  const handleBlur = () => {
    if (engine.running && !engine.paused) {
      engine.pause();
    }
  };

  // Resume on focus
  const handleFocus = () => {
    if (engine.paused && engine.cursor > 0) {
      inputRef.current?.focus();
      engine.resume();
    }
  };

  // Get color based on character status
  const getCharColor = (index: number): string => {
    const status = engine.status[index];
    if (status === "correct") return "text-highlight";
    if (status === "incorrect") return "text-red-500";
    if (index >= engine.cursor) return "text-foreground/60";
    return "text-foreground";
  };

  // Handle completion side effects once, outside render.
  useEffect(() => {
    if (!engine.isComplete) {
      completionHandledRef.current = false;
      return;
    }
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    if (onResultsComplete) {
      onResultsComplete({
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
      });
    }
    engine.reset();
  }, [
    engine,
    engine.isComplete,
    highScore,
    language,
    mode,
    onResultsComplete,
    targetText,
  ]);

  if (engine.isComplete) return null;

  // Show typing test or start overlay
  return (
    <>
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onClick={() => inputRef.current?.focus()}
        className="fixed bottom-0 left-0 opacity-0 pointer-events-auto z-50"
        autoFocus
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        autoComplete="off"
        inputMode="text"
        aria-label="typing input"
        style={{ position: "fixed", bottom: "50%", left: "-9999px" }}
      />

      <motion.div
        className="w-full text-center relative flex flex-col items-center overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Text display - conditional based on displayMode */}
        <div className="mb-2 sm:mb-4 relative w-full px-2 sm:px-4 md:px-6">
          {displayMode === "normal" && (
            <div
              ref={normalContainerRef}
              className="text-xl sm:text-xl md:text-2xl leading-relaxed tracking-normal text-justify"
            >
              <span
                ref={normalMeasureRef}
                className="absolute opacity-0 pointer-events-none"
              >
                MMMMMMMMMM
              </span>
              {visibleNormalText.split("").map((char, idx) => {
                const globalIdx = normalTextStart + idx;
                return (
                  <span
                    key={globalIdx}
                    className={`${getCharColor(globalIdx)} transition-colors ${
                      globalIdx === engine.cursor
                        ? "bg-secondary border-b-2 border-highlight"
                        : ""
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          )}

          {displayMode === "tape-word" && (
            <div className="text-lg sm:text-xl md:text-2xl leading-relaxed tracking-normal text-center whitespace-nowrap overflow-hidden">
              {visibleWords.map((word, wordIdx) => {
                const globalWordIdx = tapeWordStart + wordIdx;
                const wordCharStart = wordPositions[globalWordIdx];

                return (
                  <span key={globalWordIdx}>
                    {word.split("").map((char, charIdx) => {
                      const globalCharIdx = wordCharStart + charIdx;
                      return (
                        <span
                          key={globalCharIdx}
                          className={`${getCharColor(globalCharIdx)} transition-colors ${
                            globalCharIdx === engine.cursor
                              ? "bg-secondary border-b-2 border-highlight"
                              : ""
                          }`}
                        >
                          {char}
                        </span>
                      );
                    })}
                    {wordIdx < visibleWords.length - 1 && " "}
                  </span>
                );
              })}
            </div>
          )}

          {displayMode === "tape-char" && (
            <div className="text-lg sm:text-xl md:text-2xl leading-relaxed tracking-normal text-center whitespace-pre-wrap">
              {tapeCharText.split("").map((char, charIdx) => {
                const globalIdx = tapeCharStart + charIdx;
                return (
                  <span
                    key={globalIdx}
                    className={`${getCharColor(globalIdx)} transition-colors ${
                      globalIdx === engine.cursor
                        ? "bg-secondary border-b-2 border-highlight"
                        : ""
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          )}

          {/* Start or Resume overlay - only show if truly paused or before start */}
          {engine.paused && !engine.isComplete && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/10 flex flex-col items-center justify-center rounded">
              <Button onClick={handleStartClick} variant="primary">
                resume
              </Button>
            </div>
          )}

        </div>
        {/* Stats - only show in development mode */}
        {import.meta.env.MODE === "development" && engine.running && (
          <div className="hidden sm:block text-xs text-foreground opacity-60 tracking-wide space-y-1">
            <div>
              wpm: {engine.wpm} | acc: {Math.round(engine.accuracy)}% | errors:{" "}
              {engine.errors}
            </div>
            <div>
              cursor: {engine.cursor} | typed: {engine.totalTyped} | correct:{" "}
              {engine.correctChars} | elapsed: {engine.elapsed}s
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

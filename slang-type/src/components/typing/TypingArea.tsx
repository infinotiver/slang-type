import { useRef, useMemo } from "react";
import ResultsModal from "../ui/ResultsModal";
import Button from "../ui/Button";
import type { DisplayMode, Mode, Language } from "../../types";
import type { TypingAttempt } from "../../types";

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

interface TypingAreaProps {
  targetText: string;
  engine: UseTypingEngineReturn;
  displayMode: DisplayMode;
  mode: Mode;
  language: Language;
  highScore: number;
  onAttemptComplete?: (attempt: TypingAttempt) => void;
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

const MAX_VISIBLE_LINES = 5; // Configurable

export default function TypingArea({
  targetText,
  engine,
  displayMode,
  mode,
  language,
  highScore,
  onAttemptComplete,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // NORMAL MODE: Split text into lines (approximate based on ~60 chars per line)
  const CHARS_PER_LINE = 60;
  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < targetText.length; i += CHARS_PER_LINE) {
      result.push(targetText.substring(i, i + CHARS_PER_LINE));
    }
    return result;
  }, [targetText]);

  // Calculate which line the cursor is on
  const currentLine = Math.floor(engine.cursor / CHARS_PER_LINE);
  const lineStart = Math.max(0, currentLine - 2); // Keep cursor on 3rd visible line
  const lineEnd = lineStart + MAX_VISIBLE_LINES;

  // Get visible lines and their character ranges
  const visibleLines = lines.slice(lineStart, lineEnd);
  const visibleCharStart = lineStart * CHARS_PER_LINE;

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

  // Find current word index based on cursor position
  const currentWordIdx = useMemo(() => {
    for (let i = wordPositions.length - 1; i >= 0; i--) {
      if (engine.cursor >= wordPositions[i]) {
        return i;
      }
    }
    return 0;
  }, [engine.cursor, wordPositions]);

  // Calculate visible words for tape-word mode (show context: 2 before, current, 2 after)
  const TAPE_WORD_CONTEXT = 2;
  const tapeWordStart = Math.max(0, currentWordIdx - TAPE_WORD_CONTEXT);
  const tapeWordEnd = Math.min(
    words.length,
    currentWordIdx + TAPE_WORD_CONTEXT + 1,
  );
  const visibleWords = words.slice(tapeWordStart, tapeWordEnd);

  // Calculate visible characters for tape-char mode (show 60 char window centered on cursor)
  const TAPE_CHAR_WINDOW = 60;
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

  // Handle keyboard input - engine handles escape internally
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    engine.handleKey(e);
    if (inputRef.current) inputRef.current.value = "";
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
    return "text-foreground";
  };

  // Show results
  if (engine.isComplete) {
    const handleResultsClose = () => {
      // Save attempt to history
      if (onAttemptComplete) {
        const attempt: TypingAttempt = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          wpm: engine.wpm,
          accuracy: engine.accuracy,
          errors: engine.errors,
          elapsed: engine.elapsed,
          mode,
          language,
          totalTyped: engine.totalTyped,
          correctChars: engine.correctChars,
        };
        onAttemptComplete(attempt);
      }
      engine.reset();
    };

    return (
      <ResultsModal
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        errors={engine.errors}
        elapsed={engine.elapsed}
        totalTyped={engine.totalTyped}
        correctChars={engine.correctChars}
        charStatus={engine.status}
        isNewHighScore={engine.wpm > highScore}
        isBaseline={highScore === 0}
        targetText={targetText}
        onReset={handleResultsClose}
      />
    );
  }

  // Show typing test or start overlay
  return (
    <>
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        autoFocus
      />

      <div className="w-full text-center relative flex flex-col items-center">
        {/* Text display - conditional based on displayMode */}
        <div className="mb-4 relative w-full max-w-5xl">
          {displayMode === "normal" && (
            <div className="text-2xl leading-relaxed tracking-normal text-center ">
              {visibleLines.map((line, lineIdx) => (
                <span key={lineStart + lineIdx}>
                  {line.split("").map((char, charIdx) => {
                    const globalIdx =
                      visibleCharStart + lineIdx * CHARS_PER_LINE + charIdx;
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
                  {lineIdx < visibleLines.length - 1 && <br />}
                </span>
              ))}
            </div>
          )}

          {displayMode === "tape-word" && (
            <div className="text-2xl leading-relaxed tracking-normal text-center whitespace-nowrap overflow-hidden">
              {visibleWords.map((word, wordIdx) => {
                const globalWordIdx = tapeWordStart + wordIdx;
                const wordCharStart = wordPositions[globalWordIdx];
                const wordCharEnd = wordCharStart + word.length;
                const isCurrent = currentWordIdx === globalWordIdx;

                // Check if all characters in this word are correct/incorrect
                let wordStatus: "correct" | "incorrect" | "pending" = "pending";
                if (wordCharEnd <= engine.cursor) {
                  // Word is completely typed
                  let allCorrect = true;
                  for (let i = wordCharStart; i < wordCharEnd; i++) {
                    if (engine.status[i] === "incorrect") {
                      wordStatus = "incorrect";
                      allCorrect = false;
                      break;
                    }
                  }
                  if (allCorrect) wordStatus = "correct";
                } else if (wordCharStart <= engine.cursor) {
                  // Word is partially typed
                  let hasIncorrect = false;
                  for (
                    let i = wordCharStart;
                    i < Math.min(engine.cursor, wordCharEnd);
                    i++
                  ) {
                    if (engine.status[i] === "incorrect") {
                      hasIncorrect = true;
                      break;
                    }
                  }
                  wordStatus = hasIncorrect ? "incorrect" : "correct";
                }

                const wordColor =
                  wordStatus === "correct"
                    ? "text-highlight"
                    : wordStatus === "incorrect"
                      ? "text-red-500"
                      : "text-foreground";

                return (
                  <span
                    key={globalWordIdx}
                    className={`${wordColor} ${
                      isCurrent
                        ? "bg-secondary border-b-2 border-highlight"
                        : ""
                    } transition-colors`}
                  >
                    {word}
                    {wordIdx < visibleWords.length - 1 && " "}
                  </span>
                );
              })}
            </div>
          )}

          {displayMode === "tape-char" && (
            <div className="text-2xl leading-relaxed tracking-normal text-center whitespace-pre-wrap">
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

          {/* Show start button only before test starts */}
          {!engine.running &&
            !engine.paused &&
            !engine.isComplete &&
            engine.cursor === 0 && (
              <div className="absolute inset-0 backdrop-blur-sm bg-black/10 flex flex-col items-center justify-center rounded">
                <Button onClick={handleStartClick} variant="primary">
                  click here to start typing
                </Button>
              </div>
            )}
        </div>

        {/* Stats */}
        {engine.running && (
          <div className="text-xs text-foreground opacity-60 tracking-wide space-y-1">
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
      </div>
    </>
  );
}

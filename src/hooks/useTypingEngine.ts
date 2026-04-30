import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateAccuracy, calculateWPM } from "../utils/calculateStats";
import useSound from "use-sound";
import singleKeySound from "/singlekey.wav";
import errorSound from "/error.mp3";

export type Mode = "timed" | "inf";
export type CharStatus = "pending" | "correct" | "incorrect";

export type TimerObject = {
  elapsed: number; // seconds passed
  running: boolean; // is time moving?
  expired?: boolean; // only relevant for timed mode
  start: () => void;
  stop: () => void;
  reset: () => void;
};

export type UseTypingEngineProps = {
  targetText?: string;
  timer: TimerObject;
  mode?: Mode;
  allowExtra?: boolean;
};

export default function useTypingEngine({
  targetText = "",
  timer,
  mode = "timed",
  allowExtra = false,
}: UseTypingEngineProps) {
  const target = useMemo(() => targetText.split(""), [targetText]);
  const length = target.length;

  // lightweight mutable stores (refs) to avoid heavy re-renders on every keystroke
  const statusRef = useRef<Record<number, CharStatus>>({});
  const correctRef = useRef<number>(0);
  const typedRef = useRef<number>(0);
  const extraTypedRef = useRef<number>(0);

  const [cursor, setCursor] = useState<number>(0); // next index to type
  const [errors, setErrors] = useState<number>(0);
  const [runningFlag, setRunningFlag] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false); // Pause state
  const correctChars = correctRef.current;
  const totalTyped = typedRef.current + extraTypedRef.current;
  const rawWpm = calculateWPM(totalTyped, timer.elapsed);
  const accuracy = calculateAccuracy(totalTyped, errors);
  const wpm = Math.round((accuracy / 100) * rawWpm);

  // Sound effects - keep static to avoid re-initializing
  const [keySound] = useSound(singleKeySound, {
    volume: 0.4,
    playbackRate: 1,
    interrupt: true,
  });
  const [errorSoundPlay] = useSound(errorSound, { volume: 0.5 });

  useEffect(() => {
    const passageDone = cursor >= length && mode === "inf";
    const timedDone = mode === "timed" && (timer.expired ?? false);
    const done = passageDone || timedDone;
    if (done && !isComplete) {
      timer.stop();
      setIsComplete(true);
      setRunningFlag(false);
    }
    // keep isComplete false when timer reset externally
    if (!done && isComplete) setIsComplete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, length, mode, timer.expired, timer.elapsed]);

  // resync on space after each word

  const findNextWordStart = useCallback(
    (fromIndex: number) => {
      let i = fromIndex;

      // move to space/end of current word
      while (i < length && target[i] !== " ") i++;

      // skip spaces
      while (i < length && target[i] === " ") i++;
      return i;
    },
    [length, target],
  );

  const handleKey = useCallback(
    (e: { key: string }) => {
      if (isComplete) return;
      const key = e.key;
      // Handle Escape for pause/resume
      if (key === "Escape") {
        if (runningFlag && !paused) {
          // Pause
          timer.stop();
          setPaused(true);
        } else if (paused) {
          // Resume - use timer.resume if available, otherwise start
          if ("resume" in timer && typeof timer.resume === "function") {
            timer.resume();
          } else {
            timer.start();
          }
          setPaused(false);
        }
        return;
      }

      // Word-boundary resync
      // If user presses space while misaligned, mark one error  and jump to next word.
      if (key === " ") {
        const idx = cursor;

        if (idx < length && target[idx] == " ") {
          statusRef.current[idx] = "correct";
          correctRef.current += 1;
          typedRef.current += 1;
          keySound();
          setCursor((c) => c + 1);
          return;
        }
        // misaligned space: fail current word, resync to next
        typedRef.current += 1;
        setErrors((s) => s + 1);
        errorSoundPlay();
        setCursor(findNextWordStart(idx));
        return;
      }

      // start on first keystroke (only if not already started)
      if (!timer.running && !runningFlag && !paused) {
        timer.start();
        setRunningFlag(true);
      }
      if (key.length === 1) {
        const idx = cursor;
        const expected = target[idx];

        // if inside target
        if (idx < length) {
          const isCorrect = key === expected;
          statusRef.current[idx] = isCorrect ? "correct" : "incorrect";
          if (isCorrect) {
            correctRef.current += 1;
            keySound();
          } else {
            setErrors((s) => s + 1);
            errorSoundPlay();
          }
          typedRef.current += 1;
          setCursor((c) => c + 1);
        } else {
          // typing beyond target
          if (allowExtra) {
            extraTypedRef.current += 1;
            setErrors((s) => s + 1);
            setCursor((c) => c + 1);
          }
        }
        return;
      }
      // Backspace: undo previous char if any
      if (key === "Backspace") {
        if (cursor === 0) return;
        const prev = cursor - 1;
        // if we were extra typing beyond target
        if (prev >= length) {
          setCursor(prev);
          return;
        }
        const prevStatus = statusRef.current[prev];
        if (!prevStatus || prevStatus === "pending") {
          // nothing typed there (shouldn't normally happen)
          setCursor(prev);
          return;
        }
        if (prevStatus === "correct") {
          correctRef.current = Math.max(0, correctRef.current - 1);
        }
        delete statusRef.current[prev];
        setCursor(prev);
        return;
      }
    },
    // dependencies: cursor and runningFlag are read inside; keep minimal by not listing mutable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cursor,
      length,
      mode,
      allowExtra,
      timer,
      runningFlag,
      isComplete,
      paused,
      keySound,
      errorSoundPlay,
      findNextWordStart,
    ],
  );
  // external reset/start helpers
  const reset = useCallback(() => {
    statusRef.current = {};
    correctRef.current = 0;
    typedRef.current = 0;
    extraTypedRef.current = 0;
    setCursor(0);
    setErrors(0);
    setIsComplete(false);
    setRunningFlag(false);
    timer.reset();
  }, [timer]);
  const start = useCallback(() => {
    if (!timer.running) timer.start();
    setRunningFlag(true);
  }, [timer]);

  const stop = useCallback(() => {
    if (timer.running) timer.stop();
    setRunningFlag(false);
    setPaused(false); // Clear paused state on stop
  }, [timer]);

  // Pause/Resume helpers
  const pause = useCallback(() => {
    if (timer.running) {
      timer.stop();
      setPaused(true);
    }
  }, [timer]);

  const resume = useCallback(() => {
    if ("resume" in timer && typeof timer.resume === "function") {
      timer.resume();
    } else {
      timer.start();
    }
    setPaused(false);
  }, [timer]);

  return {
    // state
    cursor,
    status: statusRef.current as Record<number, CharStatus>,
    errors,
    running: timer.running,
    paused,
    elapsed: timer.elapsed,
    isComplete,
    // metrics
    wpm,
    accuracy,
    totalTyped,
    correctChars,
    // actions
    handleKey,
    start,
    stop,
    pause,
    resume,
    reset,
  };
}

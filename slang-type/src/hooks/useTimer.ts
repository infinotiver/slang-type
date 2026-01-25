import { useState, useRef, useEffect, useMemo } from "react";

interface UseTimerOptions {
  duration?: number | null;
}

interface UseTimerReturn {
  running: boolean;
  elapsed: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  resume: () => void;
  expired: boolean;
}

export default function useTimer({
  duration = null,
}: UseTimerOptions = {}): UseTimerReturn {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Increment elapsed time every second when running
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Memoize expired state to use as dependency
  const expired = useMemo(
    () => duration != null && elapsed >= duration,
    [duration, elapsed],
  );

  const start = () => {
    setElapsed(0);
    setRunning(true);
  };

  const stop = () => setRunning(false);

  const resume = () => setRunning(true); // Resume without resetting elapsed

  const reset = () => {
    setElapsed(0);
    setRunning(false);
  };

  return { running, elapsed, start, stop, reset, resume, expired };
}

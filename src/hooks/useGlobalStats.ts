import { useState, useCallback, useEffect } from "react";

export interface GlobalUsage {
  testsCount: number;
  totalTypedSeconds: number;
  updatedAt: string | null;
}

const DEFAULT_POLL_MS = 20_000;

export interface UseGlobalUsageOptions {
  pollIntervalMs?: number;

  enabled?: boolean;
}

export function useGlobalUsage(options: UseGlobalUsageOptions = {}) {
  const { pollIntervalMs = DEFAULT_POLL_MS, enabled = true } = options;

  const [usage, setUsage] = useState<GlobalUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) return;
      setUsage((await res.json()) as GlobalUsage);
    } catch {
      // best-effort — this is a vanity stat, never block the UI on it
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Runs immediately whenever this effect (re)starts — which includes the
    // moment `enabled` flips from false to true, e.g. a modal opening.
    refresh();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(refresh, pollIntervalMs);
    };
    const stopPolling = () => {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        refresh();
        startPolling();
      }
    };

    if (!document.hidden) startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh, pollIntervalMs, enabled]);

  const recordCompletion = useCallback(async (elapsedSeconds: number) => {
    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elapsedSeconds }),
      });
      if (res.ok) {
        setUsage((await res.json()) as GlobalUsage);
      }
    } catch {
      // fire-and-forget
    }
  }, []);

  return { usage, loading, recordCompletion, refresh };
}

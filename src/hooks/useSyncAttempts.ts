import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { saveAttempts } from "@/api/results";
import type { TypingAttempt } from "@shared-types/index";

const LS_KEY = "slangtype_attempts";

function readLocal(): TypingAttempt[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as TypingAttempt[]) : [];
  } catch {
    return [];
  }
}

function clearLocal() {
  localStorage.removeItem(LS_KEY);
}

export type SyncStatus = "idle" | "syncing" | "done" | "error";

export function useSyncAttempts() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const ran = useRef(false);

  const sync = useCallback(async () => {
    const local = readLocal();
    if (local.length === 0) {
      setStatus("done");
      return;
    }
    setStatus("syncing");
    try {
      const result = await saveAttempts(local);
      if (!result.ok || result.received !== local.length) {
        throw new Error("sync_not_confirmed");
      }
      clearLocal();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (user && !ran.current) {
      ran.current = true;
      void sync();
    }
  }, [user, sync]);

  return { status };
}

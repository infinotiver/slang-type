import type { TypingAttempt } from "@shared-types/index";

export const MODE_ORDER: Record<string, number> = {
  "15s": 0,
  "30s": 1,
  "60s": 2,
  "120s": 3,
};

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

export function getLanguageLabel(language: TypingAttempt["language"] | string) {
  return (
    { slang: "slang", english: "english", code: "code" }[language] ?? language
  );
}

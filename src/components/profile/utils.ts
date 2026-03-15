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

export function getLanguageLabel(language: TypingAttempt["language"] | string) {
  return (
    { slang: "slang", english: "english", code: "code" }[language] ?? language
  );
}

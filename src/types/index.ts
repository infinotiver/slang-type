// Language and Mode types
export type Language = "slang" | "english" | "code" | "ai";
export type Mode = "15s" | "30s" | "60s" | "120s" | "inf" | "ai";

export const THEMES = [
  "dark",
  "light",
  "latte",
  "frappe",
  "mocha",
  "nord",
  "gruvbox",
  "bold",
] as const;

export type Theme = (typeof THEMES)[number];
export type DisplayMode = "normal";

// Component Props
export interface StatsAndControlsProps {
  wpm: number;
  accuracy: number;
  language: Language;
  mode: Mode;
  onLanguageChange: (lang: string) => void;
  onModeChange: (mode: string) => void;
}

export interface TypingAttempt {
  id: string;
  timestamp: number;
  wpm: number;
  accuracy: number;
  errors: number;
  elapsed: number;
  mode: Mode;
  language: Language;
  totalTyped: number;
  correctChars: number;
  targetText?: string;
  charStatus?: Record<number, "pending" | "correct" | "incorrect">;
  aiGenerated: boolean;
}

// Page state/context types
export interface OutletContext {
  displayMode: DisplayMode;
}

export interface ResultsPayload {
  id: string;
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
  aiGenerated?: boolean;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

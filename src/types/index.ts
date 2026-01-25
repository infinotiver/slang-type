// Language and Mode types
export type Language = "slang" | "english" | "code";
export type Mode = "15s" | "30s" | "60s" | "120s" | "inf";
export type Theme =
  | "dark"
  | "light"
  | "latte"
  | "frappe"
  | "mocha"
  | "nord"
  | "gruvbox";
export type DisplayMode = "normal" | "tape-word" | "tape-char";
export type StatsDisplay = "normal" | "mini";

// Component Props
export interface StatsAndControlsProps {
  wpm: number;
  accuracy: number;
  language: Language;
  mode: Mode;
  slangDisabled: boolean;
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
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

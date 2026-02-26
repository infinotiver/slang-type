import type { StatsAndControlsProps, StatsDisplay } from "@shared-types/index";

export interface TypingStatusBarProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
  display?: StatsDisplay;
  isTypingRunning?: boolean;
}

export interface TypingControlsOption {
  label: string;
  disabled: boolean;
}

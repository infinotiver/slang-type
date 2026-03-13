import type { StatsAndControlsProps } from "@shared-types/index";

export interface TypingStatusBarProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
  isTypingRunning?: boolean;
  onRequestAIWords?: () => void;
}

export interface TypingControlsOption {
  label: string;
  disabled: boolean;
}

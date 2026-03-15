import type { StatsAndControlsProps } from "@shared-types/index";

export interface TypingBarProps extends StatsAndControlsProps {
  elapsed?: number;
  duration?: number;
  isTypingRunning?: boolean;
  onRequestAIWords?: () => void;
}

export interface ControlOption {
  label: string;
  disabled: boolean;
}

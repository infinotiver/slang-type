interface FormatDurationOptions {
  showSeconds?: boolean;
}

export function formatDuration(
  totalSeconds: number,
  options: FormatDurationOptions = {},
): string {
  const { showSeconds = true } = options;
  const seconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;

  if (seconds < 60) {
    return showSeconds ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    if (!showSeconds) return `${hours}h ${minutes}m`;
    return remainder === 0
      ? `${hours}h ${minutes}m`
      : `${hours}h ${minutes}m ${remainder}s`;
  }

  if (!showSeconds) return `${minutes}m`;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

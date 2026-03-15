import { formatFixed } from "@/utils/numberFormat";

interface ChartPayload {
  dataKey: string;
  value: number;
}

interface PerformanceTooltipProps {
  active?: boolean;
  payload?: ChartPayload[];
  label?: number;
}

const COLORS: Record<string, string> = {
  wpm: "#10b981",
  accuracy: "#f59e0b",
  errorsAtThisSecond: "rgb(239, 68, 68)",
};

const LABELS: Record<string, string> = {
  wpm: "Adjusted WPM",
  accuracy: "Accuracy",
  errorsAtThisSecond: "Errors",
};

const DIGITS: Record<string, number> = {
  wpm: 0,
  accuracy: 1,
  errorsAtThisSecond: 0,
};

export default function PerformanceTooltip({
  active,
  payload,
  label,
}: PerformanceTooltipProps) {
  if (!(active && payload && payload.length)) return null;

  const filtered = payload.filter((entry) => LABELS[entry.dataKey]);

  return (
    <div className="bg-secondary border border-secondary/30 rounded-lg p-2 text-[11px] space-y-1">
      <div className="text-foreground/70">{`s ${label}`}</div>
      {filtered.map((entry, index) => (
        <div
          key={`${entry.dataKey}-${index}`}
          className="flex items-center gap-2"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: COLORS[entry.dataKey] }}
          />
          <span className="text-foreground">
            {`${LABELS[entry.dataKey]}: ${formatFixed(entry.value, DIGITS[entry.dataKey] ?? 0)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

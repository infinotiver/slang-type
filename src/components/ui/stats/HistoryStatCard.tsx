interface HistoryStatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export default function HistoryStatCard({
  label,
  value,
  highlight = false,
}: HistoryStatCardProps) {
  return (
    <div>
      <div className="text-xs text-foreground/60">{label}</div>
      <div
        className={`text-2xl font-bold ${
          highlight ? "text-highlight" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

interface SummaryStatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export default function SummaryStatCard({
  label,
  value,
  highlight = false,
}: SummaryStatCardProps) {
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

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
    <div className="flex items-center gap-2.5 p-1 rounded-full bg-secondary whitespace-nowrap text-xs border border-accent/60 ">
      <div className="chip-inner" data-variant={highlight}>
        {label}
      </div>
      <div
        className={`text-xs pr-2 font-bold ${
          highlight ? "text-highlight" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

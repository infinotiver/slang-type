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
    <div className="flex items-center gap-2.5 p-1 rounded-full bg-secondary whitespace-nowrap text-xs">
      <div
        className={`px-4 py-2 rounded-full ${highlight ? "bg-highlight text-background" : "bg-accent/10 text-highlight"}  font-bold capitalize`}
      >
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

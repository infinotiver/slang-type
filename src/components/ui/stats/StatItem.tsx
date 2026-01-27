import type { ReactNode } from "react";

interface StatItemProps {
  label: string;
  value: ReactNode;
  color?: "highlight" | "red" | "normal";
}

export default function StatItem({
  label,
  value,
  color = "normal",
}: StatItemProps) {
  const colorClasses = {
    highlight: "text-highlight",
    red: "text-red-500",
    normal: "text-foreground",
  };

  return (
    <div>
      <div className="text-xs text-foreground/70 tracking-wider font-light">
        {label}
      </div>
      <div className={`text-lg font-semibold ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
  );
}

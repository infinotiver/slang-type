import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WpmProgressionPoint } from "../../../utils/historyStats";

interface ChartContainerProps {
  title: string;
  data: WpmProgressionPoint[];
  dataKey: "wpm" | "accuracy";
  stroke: string;
  yAxisDomain?: [number, number];
}

export default function ChartContainer({
  title,
  data,
  dataKey,
  stroke,
  yAxisDomain,
}: ChartContainerProps) {
  return (
    <div>
      <h2 className="text-xs font-mono text-foreground mb-2 tracking-wider uppercase">
        {title}
      </h2>
      <div className="p-2">
        {data.length > 0 ? (
          <ResponsiveContainer height={240}>
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(75, 85, 99)"
                opacity={0.25}
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-accent)"
                style={{ fontSize: "11px" }}
              />
              <YAxis
                stroke="var(--color-accent)"
                style={{ fontSize: "11px" }}
                domain={yAxisDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-secondary)",
                  border: "var(--color-accent)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={stroke}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
            no data
          </div>
        )}
      </div>
    </div>
  );
}

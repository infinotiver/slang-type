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
      <h2 className="text-xs font-mono text-foreground/70 mb-2 tracking-wider uppercase">
        {title}
      </h2>
      <div className="border border-secondary/30 rounded p-2 bg-secondary/5">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(75, 85, 99)"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
              />
              <YAxis
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: "11px" }}
                domain={yAxisDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(31, 41, 55)",
                  border: "1px solid rgb(75, 85, 99)",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={stroke}
                strokeWidth={2}
                dot={false}
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

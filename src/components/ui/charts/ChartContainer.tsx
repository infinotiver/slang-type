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
      <div className="border border-secondary/35 rounded-xl p-3 bg-secondary/8">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(75, 85, 99)"
                opacity={0.25}
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

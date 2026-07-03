import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ComputedStats } from "@hooks/useResultsStats";
import PerformanceTooltip from "./PerformanceTooltip";

interface PerformanceChartProps {
  data: ComputedStats["performanceData"];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const hasPerSecondErrors = data.some(
      (point) => (point.errorsAtThisSecond ?? 0) > 0,
    );

    return data.map((point, index) => {
      let errorsAtThisSecond = point.errorsAtThisSecond ?? 0;

      if (!hasPerSecondErrors) {
        const previousErrorRate = index > 0 ? data[index - 1].errorRate : 0;
        const delta = Math.max(0, point.errorRate - previousErrorRate);
        errorsAtThisSecond = delta > 0 ? Math.max(1, Math.round(delta)) : 0;
      }

      return {
        ...point,
        errorsAtThisSecond: errorsAtThisSecond > 0 ? errorsAtThisSecond : null,
      };
    });
  }, [data]);

  return (
    <div className="border border-secondary/35 rounded-full p-3 bg-secondary/8">
      {chartData.length > 0 ? (
        <ResponsiveContainer height={200}>
          <ComposedChart data={chartData} responsive={true}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(75, 85, 99)"
              opacity={0.25}
            />
            <XAxis
              dataKey="name"
              stroke="rgb(107, 114, 128)"
              style={{ fontSize: "11px" }}
              minTickGap={10}
            />
            <YAxis
              yAxisId="left"
              stroke="rgb(107, 114, 128)"
              label={{ value: "WPM", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgb(107, 114, 128)"
              style={{ fontSize: "11px" }}
              label={{ value: "Errors", angle: 90, position: "insideRight" }}
              allowDecimals={false}
            />
            <Tooltip content={<PerformanceTooltip />} />

            <Line
              yAxisId="left"
              type="bump"
              dataKey="wpm"
              stroke="#10b981"
              strokeWidth={4}
              dot={false}
              name="Adjusted WPM"
            />
            <Scatter
              yAxisId="right"
              dataKey="errorsAtThisSecond"
              fill="rgb(239, 68, 68)"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-32 flex items-center justify-center text-xs text-foreground/40">
          no data
        </div>
      )}
    </div>
  );
}

"use client";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export function MetricRadar({ data, previous, height = 300 }: { data: { metric: string; value: number }[]; previous?: { metric: string; value: number }[]; height?: number }) {
  const merged = data.map((d, i) => ({ ...d, previous: previous?.[i]?.value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={merged} outerRadius="62%" margin={{ left: 24, right: 24 }}>
        <PolarGrid stroke="#EDE3DA" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#6F584B" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #D8C1AE", fontSize: 12 }} />
        {previous && <Radar name="Previous" dataKey="previous" stroke="#D8C1AE" fill="#D8C1AE" fillOpacity={0.15} strokeDasharray="4 4" />}
        <Radar name="Latest" dataKey="value" stroke="#9C7E68" fill="#B99A83" fillOpacity={0.35} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

"use client";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export interface TrendPoint {
  date: string;
  [key: string]: number | string;
}

const PALETTE = ["#9C7E68", "#D8C1AE", "#49352B", "#C9A27E", "#7E9C8E", "#B5838D", "#6F584B"];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-champagne bg-white/95 px-3 py-2 text-xs shadow-soft">
      <p className="mb-1 font-medium text-cocoa">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-cocoa-soft">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-cocoa">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function ScoreAreaChart({ data, height = 220 }: { data: TrendPoint[]; height?: number }) {
  if (data.length < 2) return <EmptyTrend height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B99A83" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#B99A83" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F5EEE8" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6F584B" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6F584B" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="Score" stroke="#9C7E68" strokeWidth={2.5} fill="url(#scoreFill)" dot={{ r: 3, fill: "#9C7E68" }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MetricTrendChart({ data, metrics, height = 280 }: { data: TrendPoint[]; metrics: { key: string; label: string }[]; height?: number }) {
  const [active, setActive] = useState<string[]>(metrics.slice(0, 3).map((m) => m.key));
  if (data.length < 2) return <EmptyTrend height={height} />;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Metrics to display">
        {metrics.map((m, i) => {
          const on = active.includes(m.key);
          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={on}
              onClick={() => setActive((a) => (on ? a.filter((k) => k !== m.key) : [...a, m.key]))}
              className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition cursor-pointer", on ? "border-cocoa/20 bg-white text-cocoa shadow-soft" : "border-transparent bg-ivory text-cocoa-soft")}
            >
              <span className="size-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              {m.label}
            </button>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#F5EEE8" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6F584B" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6F584B" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          {metrics.map((m, i) =>
            active.includes(m.key) ? <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 5 }} /> : null,
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyTrend({ height }: { height: number }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-champagne bg-cream/60 text-center text-sm text-cocoa-soft" style={{ height }}>
      <p className="max-w-[16rem]">Your progress curve appears after your second analysis.</p>
    </div>
  );
}

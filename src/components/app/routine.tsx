"use client";
import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Flame, Moon, Sun, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { toggleRoutineStep } from "@/app/actions/account";
import { getProduct } from "@/lib/catalog";
import type { RoutineStep } from "@/lib/types";
import { cn } from "@/lib/utils";

type Completion = { step_id: string; completed_on: string };

export function localDate(d = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function weekStart(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return localDate(d);
}

function useToday() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localDate()), []);
  return today;
}

function isDone(step: RoutineStep, completions: Completion[], today: string) {
  if (step.time_of_day === "weekly") {
    const ws = weekStart(today);
    return completions.some((c) => c.step_id === step.id && c.completed_on >= ws && c.completed_on <= today);
  }
  return completions.some((c) => c.step_id === step.id && c.completed_on === today);
}

export function RoutineSummary({ steps, completions }: { steps: RoutineStep[]; completions: Completion[] }) {
  const today = useToday();
  if (steps.length === 0)
    return <p className="text-sm text-cocoa-soft">Your ritual is created automatically after your first analysis.</p>;
  if (!today) return <div className="skeleton h-28" />;
  const daily = steps.filter((s) => s.time_of_day !== "weekly");
  const done = daily.filter((s) => isDone(s, completions, today)).length;
  const pct = daily.length ? Math.round((done / daily.length) * 100) : 0;
  const next = daily.filter((s) => !isDone(s, completions, today)).slice(0, 4);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-4xl">{pct}%</p>
        <p className="text-xs text-cocoa-soft">{done} of {daily.length} steps today</p>
      </div>
      <Progress value={pct} className="mt-3" />
      {next.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {next.map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              {s.time_of_day === "morning" ? <Sun className="size-4 text-rosegold" /> : <Moon className="size-4 text-rosegold" />}
              <span>{s.title}</span>
              <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-cocoa-soft">{s.kind}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-emerald-700">Ritual complete for today — beautifully done.</p>
      )}
    </div>
  );
}

export function RoutineChecklist({ steps, completions }: { steps: RoutineStep[]; completions: Completion[] }) {
  const today = useToday();
  const [, start] = useTransition();
  const [optimistic, apply] = useOptimistic(completions, (state: Completion[], action: { step: string; date: string; done: boolean }) =>
    action.done ? [...state, { step_id: action.step, completed_on: action.date }] : state.filter((c) => !(c.step_id === action.step && c.completed_on === action.date)),
  );

  const stats = useMemo(() => {
    if (!today) return null;
    const daily = steps.filter((s) => s.time_of_day !== "weekly");
    const days: { day: string; pct: number }[] = [];
    let streak = 0;
    let streakBroken = false;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today + "T00:00:00");
      d.setDate(d.getDate() - i);
      const ds = localDate(d);
      const doneCount = daily.filter((s) => optimistic.some((c) => c.step_id === s.id && c.completed_on === ds)).length;
      const pct = daily.length ? Math.round((doneCount / daily.length) * 100) : 0;
      if (i < 7) days.unshift({ day: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d), pct });
      if (!streakBroken) {
        if (pct >= 50) streak++;
        else if (i > 0) streakBroken = true;
      }
    }
    return { days, streak };
  }, [today, steps, optimistic]);

  if (steps.length === 0)
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
        <p className="font-serif text-2xl">No ritual yet</p>
        <p className="mt-2 text-sm text-cocoa-soft">Run an analysis and ÉLORIA will compose your personalized ritual.</p>
      </div>
    );
  if (!today || !stats) return <div className="skeleton h-96" />;

  const toggle = (step: RoutineStep) => {
    const done = isDone(step, optimistic, today);
    // For weekly steps, unchecking removes this week's completion(s) recorded today only.
    start(async () => {
      apply({ step: step.id, date: today, done: !done });
      const res = await toggleRoutineStep(step.id, !done, today);
      if (!res.ok) toast.error(res.error);
    });
  };

  const groups: { key: RoutineStep["time_of_day"]; label: string; icon: typeof Sun }[] = [
    { key: "morning", label: "Morning", icon: Sun },
    { key: "evening", label: "Evening", icon: Moon },
    { key: "weekly", label: "This week", icon: CalendarDays },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        {groups.map((g) => {
          const list = steps.filter((s) => s.time_of_day === g.key);
          if (list.length === 0) return null;
          return (
            <section key={g.key} className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="flex items-center gap-2 text-2xl"><g.icon className="size-5 text-rosegold" /> {g.label}</h2>
              <ul className="mt-4 divide-y divide-ivory">
                {list.map((s) => {
                  const done = isDone(s, optimistic, today);
                  const product = s.product_slug ? getProduct(s.product_slug) : null;
                  return (
                    <li key={s.id} className="flex items-center gap-4 py-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={done}
                        aria-label={`Mark ${s.title} as ${done ? "not done" : "done"}`}
                        onClick={() => toggle(s)}
                        className={cn("grid size-7 shrink-0 place-items-center rounded-full border transition cursor-pointer", done ? "border-rosegold bg-rosegold text-white" : "border-champagne hover:border-rosegold")}
                      >
                        {done && <Check className="size-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", done && "text-cocoa-soft line-through")}>{s.title}</p>
                        <p className="truncate text-xs text-cocoa-soft">
                          {s.description}
                          {product && <> · <Link href={`/shop/${product.slug}`} className="text-rosegold-dark hover:underline">{product.name}</Link></>}
                        </p>
                      </div>
                      <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-cocoa-soft">{s.kind}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <aside className="space-y-6">
        <div className="rounded-3xl bg-cocoa p-6 text-cream shadow-soft">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-champagne"><Flame className="size-4" /> Streak</p>
          <p className="mt-2 font-serif text-6xl">{stats.streak}<span className="ml-2 text-xl text-cream/70">day{stats.streak === 1 ? "" : "s"}</span></p>
          <p className="mt-1 text-xs text-cream/60">Days with at least half of your ritual completed.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="font-serif text-xl">Last 7 days</p>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.days} margin={{ left: -28, right: 0, top: 8 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6F584B" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6F584B" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#F5EEE8" }} formatter={(v) => [`${v}%`, "Completed"]} contentStyle={{ borderRadius: 12, border: "1px solid #D8C1AE", fontSize: 12 }} />
                <Bar dataKey="pct" fill="#B99A83" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </aside>
    </div>
  );
}

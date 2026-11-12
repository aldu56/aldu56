import { Progress } from "@/components/ui/progress";

export function MetricBars({ items }: { items: { label: string; health: number; level: number; delta?: number | null }[] }) {
  return (
    <ul className="space-y-5">
      {items.map((m) => (
        <li key={m.label}>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span>{m.label}</span>
            <span className="flex items-baseline gap-2">
              {m.delta != null && m.delta !== 0 && (
                <span className={m.delta > 0 ? "text-xs text-emerald-700" : "text-xs text-rose-700"}>{m.delta > 0 ? "▲" : "▼"} {Math.abs(m.delta)}</span>
              )}
              <span className="font-serif text-lg tabular-nums">{m.health}</span>
            </span>
          </div>
          <Progress value={m.health} />
        </li>
      ))}
    </ul>
  );
}

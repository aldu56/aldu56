import { scoreLabel } from "@/lib/analysis/config";

export function ScoreRing({ score, size = 160, label = true }: { score: number; size?: number; label?: boolean }) {
  const stroke = size * 0.07;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const id = `ring-${size}`;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`Score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D8C1AE" />
            <stop offset="1" stopColor="#9C7E68" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F5EEE8" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="absolute text-center">
        <p className="font-serif leading-none text-cocoa" style={{ fontSize: size * 0.3 }}>{score}</p>
        {label && <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-cocoa-soft">{scoreLabel(score)}</p>}
      </div>
    </div>
  );
}

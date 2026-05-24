export const mono = { fontFamily: "'Fira Code', monospace" } as const;
export const sans = { fontFamily: "'Fira Sans', sans-serif" } as const;

export const pad2 = (n: number) => String(n).padStart(2, "0");

type DateLike = string | Date | null | undefined;

export function toTimestamp(v: DateLike): number | null {
  if (!v) return null;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

export function relativeTime(from: DateLike, now = Date.now()) {
  const t = toTimestamp(from);
  if (t === null) return "—";
  const diff = Math.max(0, now - t!);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function formatDateStamp(iso: DateLike) {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}.${m}.${day}`;
}

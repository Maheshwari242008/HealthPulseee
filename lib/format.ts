import type { Area } from '@/types/cell';

/** "Solapur Central" if the area has a real name, otherwise "Solapur · 17.67, 75.91". */
export function areaTitle(a: Area): string {
  if (a.name && !a.name.startsWith('Cell ')) return a.name;
  return `${a.district ?? 'Area'} · ${Number(a.cell_lat).toFixed(2)}, ${Number(a.cell_lon).toFixed(2)}`;
}

export function areaSubtitle(a: Area): string {
  return [a.district, a.state].filter(Boolean).join(', ');
}

export function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "+75%", "-10%", "0%", or "—" when the value is hidden by the privacy gate. */
export function growthLabel(g: number | null | undefined): string {
  if (g == null) return '—';
  return `${g > 0 ? '+' : ''}${g}%`;
}

export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** Splits a newline-separated database text field into clean lines. */
export function toLines(text: string | null | undefined): string[] {
  return text ? text.split('\n').map((s) => s.trim()).filter(Boolean) : [];
}

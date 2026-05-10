export function formatTimestamp(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;

  const pad = (n: number) => String(n).padStart(2, "0");

  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  const offset = d.getTimezoneOffset();
  const sign = offset <= 0 ? "+" : "-";
  const absOffset = Math.abs(offset);
  const tzHours = pad(Math.floor(absOffset / 60));
  const tzMins = pad(absOffset % 60);
  const tz = `${sign}${tzHours}:${tzMins}`;

  return `${date} ${time}${tz}`;
}
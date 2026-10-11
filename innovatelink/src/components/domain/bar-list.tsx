import { formatNumber } from "@/lib/utils";

/** Single-series horizontal bars (magnitude by category): one hue, direct value labels, hover title, table for AT. */
export function BarList({ rows, locale, caption, suppressedLabel }: { rows: { label: string; value: number; suppressed?: boolean }[]; locale: string; caption: string; suppressedLabel: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <figure>
      <figcaption className="mb-2 font-semibold">{caption}</figcaption>
      <ul aria-hidden className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[minmax(7rem,40%)_1fr_auto] items-center gap-2 text-sm" title={`${r.label}: ${r.suppressed ? suppressedLabel : formatNumber(r.value, locale)}`}>
            <span className="truncate text-muted-foreground">{r.label}</span>
            <span className="h-3 rounded-e bg-muted">
              {!r.suppressed && <span className="block h-3 rounded-e bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />}
            </span>
            <span className="num w-10 text-end">{r.suppressed ? "—" : formatNumber(r.value, locale)}</span>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>{rows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th><td>{r.suppressed ? suppressedLabel : r.value}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

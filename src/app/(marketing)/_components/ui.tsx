import Link from "next/link";
import type { ReactNode } from "react";

export function PageHead({ title, lead, cta }: { title: string; lead: string; cta?: { href: string; label: string } }) {
  return (
    <div className="nv-wrap nv-ph">
      <h1>{title}</h1>
      <p className="nv-lead">{lead}</p>
      {cta && <Link className="nv-btn" href={cta.href}>{cta.label}</Link>}
    </div>
  );
}

export function Section({ title, sub, tint, children }: { title?: string; sub?: string; tint?: boolean; children: ReactNode }) {
  return (
    <div className={`nv-sec${tint ? " nv-tint" : ""}`}>
      <div className="nv-wrap">
        {title && <h2>{title}</h2>}
        {sub && <p className="nv-sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

export type Item = { title: string; text: string };

export function Flow({ steps }: { steps: { label: string; note?: string }[] }) {
  return (
    <ol className="nv-flow">
      {steps.map((s) => (
        <li key={s.label}>{s.label}{s.note && <small>{s.note}</small>}</li>
      ))}
    </ol>
  );
}

export function Rows({ items }: { items: Item[] }) {
  return (
    <div className="nv-rows">
      {items.map((i) => (
        <div key={i.title}><h3>{i.title}</h3><p>{i.text}</p></div>
      ))}
    </div>
  );
}

export function Grid({ items }: { items: Item[] }) {
  return (
    <div className="nv-grid">
      {items.map((i) => (
        <div key={i.title}><h3>{i.title}</h3><p>{i.text}</p></div>
      ))}
    </div>
  );
}

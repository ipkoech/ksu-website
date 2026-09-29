"use client";
import Link from "next/link";
import { useResearchWorkspace } from "./admin-shell";
import type { RWModule, RWRow } from "@ksu/api-client/research";

/** Reverse links use only schema references that the private API can filter. */
export function RelatedRecords({ module, row }: { module: RWModule; row: RWRow }) {
  const { modules } = useResearchWorkspace();
  const links = modules.flatMap(target => target.fields.filter(field => field.kind === "uuid" && field.reference_resource === module.key && target.filter_fields?.includes(field.key))
    .map(field => ({ label: `${target.label} · ${field.label}`, href: `/admin/${target.key}?${new URLSearchParams({ filter_field: field.key, filter_value: row.id })}` })));
  if (!links.length) return null;
  return <section className="rw-panel rw-inset"><p className="rw-eyebrow">CONNECTED RECORDS</p><h2>Explore related work</h2><p>Open a scope-checked list filtered by this record’s native reference. A link does not imply matching records exist.</p>
    <div className="rw-related-links">{links.map(link => <Link className="rw-text-link" key={link.href} href={link.href}>{link.label}</Link>)}</div></section>;
}

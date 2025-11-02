// src/components/SpellsGrid.tsx
import React, { useMemo, useState } from "react";
import type { SpellRow } from "../types";
import { GenericPickerGrid } from "./GenericPickerGrid";
import type { ColumnDef, PickerFilter } from "./GenericPickerGrid";
import { lines } from "../utils/text";
import { spells as catalogSpells } from "../models/catalog";

type SpellRecord = Record<string, any>;
const NARROW = 110;

function parseMana(rec: SpellRecord): number {
  const raw = String(rec["Mana"] ?? "").trim();
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}
function hasFocus(rec: SpellRecord): boolean {
  const raw = String(rec["Focus"] ?? "")
    .trim()
    .toLowerCase();
  return raw === "yes" || raw === "y" || raw === "true" || raw === "1";
}
function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

export function SpellsGrid({
  rows,
  onChange,
  filterAbility = "",
  filterDomain = "",
}: {
  rows: SpellRow[];
  onChange: (r: SpellRow[]) => void;
  filterAbility?: string;
  filterDomain?: string;
}) {
  // Build sorted catalog once
  const spellItems = useMemo(() => {
    const copy = [...catalogSpells];
    copy.sort((a, b) => {
      const ma = parseMana(a);
      const mb = parseMana(b);
      if (ma !== mb) return ma - mb;
      const na = String(a.Name ?? "");
      const nb = String(b.Name ?? "");
      return na.localeCompare(nb, undefined, { sensitivity: "base" });
    });
    return copy;
  }, []);

  const columns: ColumnDef<SpellRow>[] = [
    { key: "name", header: "Name" },
    { key: "action", header: "Action", width: NARROW },
    { key: "mana", header: "Mana", width: NARROW },
    { key: "range", header: "Range", width: NARROW },
    { key: "duration", header: "Duration", width: NARROW },
    { key: "focus", header: "Focus", width: NARROW },
    { key: "description", header: "Description" },
  ];

  // Optional dynamic filters (ability/domain OR logic like before)
  const [ability, setAbility] = useState(filterAbility ?? "");
  const [domain, setDomain] = useState(filterDomain ?? "");

  function spellMatches(rec: SpellRecord, a: string, d: string) {
    const A = normalize(a);
    const D = normalize(d);
    if (!A && !D) return true;
    const recAbility = normalize(rec["Ability"] || "");
    const recDomains = String(rec["Domain"] || "")
      .split(",")
      .map((x) => normalize(x))
      .filter(Boolean);
    const abilityOk = A ? recAbility === A : false;
    const domainOk = D ? recDomains.includes(D) : false;
    return abilityOk || domainOk;
  }

  const filters: PickerFilter<SpellRecord, string>[] = [
    {
      label: "Ability",
      value: ability,
      onChange: setAbility,
      renderControl: (val, onCh) => (
        <input
          value={val}
          onChange={(e) => onCh(e.target.value)}
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #ccc",
            maxWidth: 240,
          }}
          placeholder="e.g. Int / Cha"
        />
      ),
      predicate: (it, v) => spellMatches(it, v, domain),
    },
    {
      label: "Domain",
      value: domain,
      onChange: setDomain,
      renderControl: (val, onCh) => (
        <input
          value={val}
          onChange={(e) => onCh(e.target.value)}
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #ccc",
            maxWidth: 240,
          }}
          placeholder="e.g. Chaos"
        />
      ),
      predicate: (it, v) => spellMatches(it, ability, v),
    },
  ];

  const getItemLabel = (rec: SpellRecord) => {
    const mana = parseMana(rec);
    const manaStr = Number.isFinite(mana) ? String(mana) : "?";
    const focusTag = hasFocus(rec) ? " (F)" : "";
    return `${manaStr} – ${rec["Name"] ?? ""}${focusTag} – ${rec["Action"] ?? ""}`;
  };

  const preview = [
    { label: "Name", value: (it: SpellRecord) => it["Name"] },
    { label: "Ability", value: (it: SpellRecord) => it["Ability"] },
    { label: "Action", value: (it: SpellRecord) => it["Action"] },
    { label: "Mana", value: (it: SpellRecord) => it["Mana"] },
    { label: "Damage Type", value: (it: SpellRecord) => it["Damage Type"] },
    { label: "Domain", value: (it: SpellRecord) => it["Domain"] },
    { label: "Duration", value: (it: SpellRecord) => it["Duration"] },
    { label: "Focus", value: (it: SpellRecord) => it["Focus"] },
    { label: "Range", value: (it: SpellRecord) => it["Range"] },
    {
      label: "Description",
      value: (it: SpellRecord) => lines(String(it["Description"] ?? "")),
    },
  ];

  return (
    <GenericPickerGrid<SpellRecord, SpellRow>
      rows={rows}
      onChange={onChange}
      columns={columns}
      catalogItems={spellItems}
      getItemLabel={getItemLabel}
      getItemKey={(rec) => String(rec["Name"] ?? "")}
      getRowCatalogKey={(row) => row.name || null}
      toRow={(rec) => ({
        name: rec["Name"] ?? "",
        action: rec["Action"] ?? "",
        mana: rec["Mana"] ?? "",
        range: rec["Range"] ?? "",
        duration: rec["Duration"] ?? "",
        focus: rec["Focus"] ?? "",
        description: rec["Description"] ?? "",
      })}
      titleAddModal="Add Spell"
      addButtonLabel="+ Add spell"
      previewSections={preview}
      filters={filters}
    />
  );
}

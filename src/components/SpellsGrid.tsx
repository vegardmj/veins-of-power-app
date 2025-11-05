// src/components/SpellsGrid.tsx
import { useMemo } from "react";
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
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY; // unknown mana goes last
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
function spellMatches(
  rec: SpellRecord,
  ability: string,
  domain: string
): boolean {
  const a = normalize(ability);
  const d = normalize(domain);
  if (!a && !d) return true; // no filter selected => show all
  const recAbility = normalize(rec["Ability"] || "");
  const recDomains = String(rec["Domain"] || "")
    .split(",")
    .map((x) => normalize(x))
    .filter(Boolean);
  const abilityOk = a ? recAbility === a : false;
  const domainOk = d ? recDomains.includes(d) : false;
  return abilityOk || domainOk; // keep your OR semantics
}

export function SpellsGrid({
  rows,
  onChange,
  filterAbility = "",
  filterDomain = "",
}: {
  rows: SpellRow[];
  onChange: (r: SpellRow[]) => void;
  /** Read-only values coming from SpellcastingBlock */
  filterAbility?: string; // "Int" | "Con" | "Cha" | ""
  filterDomain?: string; // one of DOMAINS or ""
}) {
  // Build sorted catalog once
  const spellItems = useMemo(() => {
    const copy = [...catalogSpells];
    copy.sort((a, b) => {
      const ma = parseMana(a),
        mb = parseMana(b);
      if (ma !== mb) return ma - mb;
      const na = String(a.Name ?? "");
      const nb = String(b.Name ?? "");
      return na.localeCompare(nb, undefined, { sensitivity: "base" });
    });
    return copy;
  }, []);

  const columns: ColumnDef<SpellRow>[] = [
    { key: "name", header: "Name" },
    { key: "mana", header: "Mana", width: NARROW },
    {
      key: "description",
      header: "Description",
      inputType: "textarea",
      textareaRows: 3,
    },
  ];

  // Read-only filters (rendered as disabled inputs)
  const filters: PickerFilter<SpellRecord, string>[] = [
    {
      label: "Ability (from sheet)",
      value: filterAbility,
      onChange: () => {}, // no-op (read-only)
      renderControl: (val) => (
        <input
          value={val || "—"}
          readOnly
          disabled
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #ddd",
            maxWidth: 240,
            background: "#f8f8f8",
          }}
        />
      ),
      predicate: (it) => spellMatches(it, filterAbility, filterDomain),
    },
    {
      label: "Domain (from sheet)",
      value: filterDomain,
      onChange: () => {}, // no-op (read-only)
      renderControl: (val) => (
        <input
          value={val || "—"}
          readOnly
          disabled
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #ddd",
            maxWidth: 240,
            background: "#f8f8f8",
          }}
        />
      ),
      predicate: (it) => spellMatches(it, filterAbility, filterDomain),
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

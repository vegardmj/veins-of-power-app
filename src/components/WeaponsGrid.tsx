// src/components/WeaponsGrid.tsx
import { useMemo, useState } from "react";
import type { WeaponRow } from "../types";
import { GenericPickerGrid } from "./GenericPickerGrid";
import type { ColumnDef, PickerFilter } from "./GenericPickerGrid";
import { weapons as catalogWeapons } from "../models/catalog";

type WeaponRecord = Record<string, any>;
const FIELD_W = 120;
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

function hasType(rec: WeaponRecord, wantedToken: string) {
  const raw = String(rec["Type"] ?? "");
  return raw
    .split(",")
    .map((t) => norm(t))
    .filter(Boolean)
    .some((t) => t === norm(wantedToken));
}
function isStarting(rec: WeaponRecord, want: "Starting" | "Non-starting") {
  const v = String(rec["Starting?"] ?? "")
    .trim()
    .toLowerCase();
  const yes = v === "yes" || v === "y" || v === "true";
  return want === "Starting" ? yes : !yes;
}

export function WeaponsGrid({
  rows,
  onChange,
}: {
  rows: WeaponRow[];
  onChange: (r: WeaponRow[]) => void;
}) {
  const all = useMemo(() => {
    const copy = [...catalogWeapons];
    copy.sort((a, b) =>
      String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, {
        sensitivity: "base",
      })
    );
    return copy;
  }, []);

  // Build “Type” tokens
  const allTypeTokens = useMemo(() => {
    const set = new Set<string>();
    for (const w of all) {
      const raw = String(w["Type"] ?? "");
      for (const t of raw.split(",")) {
        const tok = t.trim();
        if (tok) set.add(tok);
      }
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [all]);

  const columns: ColumnDef<WeaponRow>[] = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type", width: FIELD_W },
    { key: "dmg", header: "Damage", width: FIELD_W },
    { key: "reach", header: "Reach", width: FIELD_W },
    { key: "ability", header: "Ability", width: FIELD_W },
  ];

  // Required “Availability” filter (no “All”)
  const [availability, setAvailability] = useState<"Starting" | "Non-starting">(
    "Starting"
  );
  // Optional “Type” filter (blank = not chosen)
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filters: PickerFilter<WeaponRecord, string>[] = [
    {
      label: "Availability",
      value: availability,
      onChange: (v) => setAvailability(v as "Starting" | "Non-starting"),
      renderControl: (val, onCh) => (
        <select
          value={val}
          onChange={(e) => onCh(e.target.value)}
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #ccc",
            maxWidth: 240,
          }}
        >
          <option value="Starting">Starting</option>
          <option value="Non-starting">Non-starting</option>
        </select>
      ),
      predicate: (it, v) => isStarting(it, v as "Starting" | "Non-starting"),
    },
    {
      label: "Weapon type",
      value: typeFilter,
      onChange: setTypeFilter,
      renderControl: (val, onCh) => (
        <select
          value={val}
          onChange={(e) => onCh(e.target.value)}
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #ccc",
            maxWidth: 420,
          }}
        >
          <option value="">— Choose —</option>
          {allTypeTokens.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ),
      predicate: (it, v) => (v ? hasType(it, v) : true),
    },
  ];

  const preview = [
    { label: "Name", value: (it: WeaponRecord) => it["Name"] },
    { label: "dmg", value: (it: WeaponRecord) => it["dmg"] },
    { label: "Reach", value: (it: WeaponRecord) => it["Reach"] },
    {
      label: "Ability modifier",
      value: (it: WeaponRecord) => it["Ability modifier"],
    },
    { label: "Type", value: (it: WeaponRecord) => it["Type"] },
    {
      label: "1 handed req.",
      value: (it: WeaponRecord) => it["1 handed req."],
    },
    { label: "Rarity", value: (it: WeaponRecord) => it["Rarity"] },
    { label: "Stock mod.", value: (it: WeaponRecord) => it["Stock mod."] },
    { label: "Starting?", value: (it: WeaponRecord) => it["Starting?"] },
  ];

  return (
    <GenericPickerGrid<WeaponRecord, WeaponRow>
      rows={rows}
      onChange={onChange}
      columns={columns}
      catalogItems={all}
      getItemLabel={(w) => String(w.Name ?? "")}
      getItemKey={(w) => String(w.Name ?? "")}
      getRowCatalogKey={(row) => row.name || null}
      toRow={(w) => ({
        name: w["Name"] ?? "",
        type: w["Type"] ?? "",
        dmg: w["dmg"] ?? "",
        bonus: w["Bonus"] ?? "",
        reach: w["Reach"] ?? "",
        ability: w["Ability modifier"] ?? "",
        starting: w["Starting?"] ?? "",
      })}
      titleAddModal="Add Weapon"
      addButtonLabel="+ Add weapon"
      previewSections={preview}
      filters={filters}
    />
  );
}

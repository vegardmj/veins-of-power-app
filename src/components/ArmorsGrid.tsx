// src/components/ArmorsGrid.tsx
import React, { useMemo, useState } from "react";
import type { ArmorRow } from "../types";
import { GenericPickerGrid } from "./GenericPickerGrid";
import type { ColumnDef, PickerFilter } from "./GenericPickerGrid";
import { lines } from "../utils/text";
import { armors as catalogArmors } from "../models/catalog";

type ArmorRecord = Record<string, any>;
const FIELD_W = 120;
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

function isStarting(rec: ArmorRecord, want: "Starting" | "Non-starting") {
  const v = norm(String(rec["Starting?"] ?? ""));
  const yes = v === "yes" || v === "y" || v === "true" || v === "1";
  return want === "Starting" ? yes : !yes;
}

function hasType(rec: ArmorRecord, wanted: string) {
  if (!wanted) return true; // blank = no filter
  const raw = String(rec["Type"] ?? "");
  // In case you ever store multiple tokens, support comma-sep
  const tokens = raw
    .split(",")
    .map((t) => norm(t))
    .filter(Boolean);
  return tokens.length
    ? tokens.includes(norm(wanted))
    : norm(raw) === norm(wanted);
}

export function ArmorsGrid({
  rows,
  onChange,
}: {
  rows: ArmorRow[];
  onChange: (r: ArmorRow[]) => void;
}) {
  // ---- Catalog (sorted) + distinct type list
  const { items, allTypes } = useMemo(() => {
    const copy = [...catalogArmors];
    copy.sort((a, b) =>
      String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, {
        sensitivity: "base",
      })
    );
    const typeSet = new Set<string>();
    for (const a of copy) {
      const raw = String(a["Type"] ?? "");
      for (const tok of raw.split(",")) {
        const t = tok.trim();
        if (t) typeSet.add(t);
      }
    }
    return {
      items: copy,
      allTypes: Array.from(typeSet).sort((x, y) =>
        x.localeCompare(y, undefined, { sensitivity: "base" })
      ),
    };
  }, []);

  // ---- Columns
  const columns: ColumnDef<ArmorRow>[] = [
    { key: "name", header: "Name" },
    { key: "type", header: "Type", width: FIELD_W },
    { key: "acBonus", header: "AC bonus", width: FIELD_W },
    { key: "penalty", header: "Penalty", width: FIELD_W },
    { key: "property", header: "Property", width: FIELD_W },
  ];

  // ---- Filters
  const [availability, setAvailability] = useState<"Starting" | "Non-starting">(
    "Starting"
  );
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filters: PickerFilter<ArmorRecord, string>[] = [
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
      label: "Armor type",
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
          {allTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ),
      predicate: (it, v) => (v ? hasType(it, v) : true),
    },
  ];

  // ---- Preview
  const preview = [
    { label: "Name", value: (it: ArmorRecord) => it["Name"] },
    { label: "AC bonus", value: (it: ArmorRecord) => it["AC bonus"] },
    { label: "Penalty", value: (it: ArmorRecord) => it["Penalty"] },
    { label: "Property", value: (it: ArmorRecord) => it["Property"] },
    { label: "Requirements", value: (it: ArmorRecord) => it["Requirements"] },
    { label: "Type", value: (it: ArmorRecord) => it["Type"] },
    { label: "Starting?", value: (it: ArmorRecord) => it["Starting?"] },
  ];

  return (
    <GenericPickerGrid<ArmorRecord, ArmorRow>
      rows={rows}
      onChange={onChange}
      columns={columns}
      catalogItems={items}
      getItemLabel={(a) => String(a.Name ?? "")}
      getItemKey={(a) => String(a.Name ?? "")}
      getRowCatalogKey={(row) => row.name || null}
      toRow={(a) => ({
        name: a["Name"] ?? "",
        type: a["Type"] ?? "",
        acBonus: a["AC bonus"] ?? "",
        penalty: a["Penalty"] ?? "",
        property: a["Property"] ?? "",
        requirements: a["Requirements"] ?? "",
        starting: a["Starting?"] ?? "",
      })}
      titleAddModal="Add Armor"
      addButtonLabel="+ Add armor"
      previewSections={preview}
      filters={filters}
    />
  );
}

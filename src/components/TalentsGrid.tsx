// src/components/TalentsGrid.tsx
import React, { useMemo, useState } from "react";
import type { TalentRow } from "../types";
import { GenericPickerGrid } from "./GenericPickerGrid";
import type { ColumnDef, PickerFilter } from "./GenericPickerGrid";

import { lines } from "../utils/text";
import { talents as catalogTalents } from "../models/catalog";

type TalentRecord = Record<string, any>;
const FIELD_W = 120;
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export function TalentsGrid({
  rows,
  onChange,
}: {
  rows: TalentRow[];
  onChange: (r: TalentRow[]) => void;
}) {
  const items = useMemo(() => {
    const copy = [...catalogTalents];
    copy.sort((a, b) =>
      String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, {
        sensitivity: "base",
      })
    );
    return copy;
  }, []);

  const columns: ColumnDef<TalentRow>[] = [
    { key: "name", header: "Name" },
    { key: "action", header: "Action", width: FIELD_W },
    { key: "description", header: "Description" },
  ];

  // “Type” filter based on the "Table" field (Main / Secondary). No "All".
  const [selectedType, setSelectedType] = useState<"Main" | "Secondary">(
    "Main"
  );

  const matchesType = (rec: TalentRecord, t: "Main" | "Secondary") =>
    norm(rec.Table ?? rec.table) === norm(t);

  const filters: PickerFilter<TalentRecord, string>[] = [
    {
      label: "Type",
      value: selectedType,
      onChange: (v) => setSelectedType(v as "Main" | "Secondary"),
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
          <option value="Main">Main</option>
          <option value="Secondary">Secondary</option>
        </select>
      ),
      predicate: (it, v) => matchesType(it, v as "Main" | "Secondary"),
    },
  ];

  const previewFields = [
    { label: "Name", value: (it: TalentRecord) => it["Name"] },
    { label: "Action", value: (it: TalentRecord) => it["Action"] },
    { label: "Mana", value: (it: TalentRecord) => it["Mana"] },
    { label: "Order", value: (it: TalentRecord) => it["Order"] },
    { label: "Requirements", value: (it: TalentRecord) => it["Requirements"] },
    {
      label: "Race requirements",
      value: (it: TalentRecord) => it["Race requirements"],
    },
    {
      label: "Description",
      value: (it: TalentRecord) => lines(String(it["Description"] ?? "")),
    },
  ];

  return (
    <GenericPickerGrid<TalentRecord, TalentRow>
      rows={rows}
      onChange={onChange}
      columns={columns}
      catalogItems={items}
      getItemLabel={(t) => String(t.Name ?? "")}
      getItemKey={(t) => String(t.Name ?? "")}
      getRowCatalogKey={(row) => row.name || null}
      toRow={(t) => ({
        name: t["Name"] ?? "",
        action: t["Action"] ?? "",
        description: t["Description"] ?? "",
      })}
      titleAddModal="Add Talent"
      addButtonLabel="+ Add talent"
      previewSections={previewFields}
      filters={filters}
    />
  );
}

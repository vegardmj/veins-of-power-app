// src/components/TalentsGrid.tsx
import React, { useMemo, useRef, useState } from "react";
import type { TalentRow } from "../types";
import { GenericPickerGrid } from "./GenericPickerGrid";
import type { ColumnDef, PickerFilter } from "./GenericPickerGrid";
import { talents as catalogTalents } from "../models/catalog";
import { lines } from "../utils/text";

type TalentRecord = Record<string, any>;

const norm = (s?: string) => (s ?? "").trim().toLowerCase();
const tableOf = (rec: TalentRecord) => norm(rec.Table ?? rec.table);

function talentLabel(rec: TalentRecord) {
  const name = String(rec.Name ?? "").trim();
  const req = String(rec.Requirements ?? "").trim();
  return req ? `${name} (${req})` : name;
}

function childSelectionCount(rec: TalentRecord): number {
  const raw = String(rec["No. child selections"] ?? "").trim();
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function TalentsGrid({
  rows,
  onChange,
}: {
  rows: TalentRow[];
  onChange: (r: TalentRow[]) => void;
}) {
  // Catalog + maps
  const items = useMemo(() => {
    const copy = [...catalogTalents];
    copy.sort((a, b) =>
      String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, {
        sensitivity: "base",
      })
    );
    return copy;
  }, []);

  const byName = useMemo(() => {
    const m: Record<string, TalentRecord> = {};
    for (const t of items) {
      const n = String(t.Name ?? "").trim();
      if (n) m[n] = t;
    }
    return m;
  }, [items]);

  const toRowFromRec = (t: TalentRecord): TalentRow => ({
    name: t["Name"] ?? "",
    action: t["Action"] ?? "",
    description: t["Description"] ?? "",
  });

  // Grid columns
  const columns: ColumnDef<TalentRow>[] = [
    { key: "name", header: "Name" },
    { key: "action", header: "Action", width: 120 },
    {
      key: "description",
      header: "Description",
      inputType: "textarea",
      textareaRows: 3,
    },
  ];

  // Table filter
  const [selectedType, setSelectedType] = useState<"Main" | "Secondary">(
    "Main"
  );
  const typeFilter: PickerFilter<TalentRecord, "Main" | "Secondary"> = {
    label: "Type",
    value: selectedType,
    onChange: (v) => setSelectedType(v as "Main" | "Secondary"),
    renderControl: (val, onChange) => (
      <select
        value={val}
        onChange={(e) => onChange(e.target.value as "Main" | "Secondary")}
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
    predicate: (rec, v) => tableOf(rec) === norm(v),
  };

  // ---- Child selection state
  const [childChoices, setChildChoices] = useState<string[]>([]);
  const lastSelectedNameRef = useRef<string>("");

  const extraPickers = (selected: TalentRecord | null) => {
    const selectedName = String(selected?.Name ?? "").trim();
    const count = selected ? childSelectionCount(selected) : 0;

    // resize/reset when parent or count changes
    if (lastSelectedNameRef.current !== selectedName) {
      lastSelectedNameRef.current = selectedName;
      setTimeout(
        () => setChildChoices(Array.from({ length: count }, () => "")),
        0
      );
    } else if (childChoices.length !== count) {
      setTimeout(() => {
        setChildChoices((prev) => {
          const next = prev.slice(0, count);
          while (next.length < count) next.push("");
          return next;
        });
      }, 0);
    }

    // candidates: ParentName === parent.Name
    const candidates: TalentRecord[] = selectedName
      ? items.filter(
          (rec) => String(rec.ParentName ?? "").trim() === selectedName
        )
      : [];

    // UI (pickers + chosen child info)
    let controls: React.ReactNode = null;

    if (count && candidates.length > 0) {
      const chosenRecords = childChoices
        .map((n) => byName[n])
        .filter(Boolean) as TalentRecord[];

      controls = (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontWeight: 600, opacity: 0.9 }}>
            Choose child talents
          </div>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{ display: "grid", gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Child selection {i + 1}
              </label>
              <select
                value={childChoices[i] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setChildChoices((prev) => {
                    const next = [...prev];
                    next[i] = v;
                    return next;
                  });
                }}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  maxWidth: 420,
                }}
              >
                <option value="">— Choose —</option>
                {candidates.map((rec) => {
                  const label = talentLabel(rec);
                  const value = String(rec.Name ?? "");
                  return (
                    <option key={value || label} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}

          {/* Chosen child info */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 10,
              marginTop: 6,
            }}
          >
            {chosenRecords.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {chosenRecords.map((rec) => (
                  <div
                    key={String(rec.Name ?? Math.random())}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{rec.Name}</div>
                    {[
                      ["Action", rec.Action],
                      ["Requirements", rec.Requirements],
                      ["Order", rec.Order],
                      ["Race requirements", rec["Race requirements"]],
                      [
                        "Description",
                        rec.Description ? lines(String(rec.Description)) : "",
                      ],
                    ].map(([label, value]) =>
                      value ? (
                        <div key={label as string} style={{ marginTop: 6 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              opacity: 0.7,
                            }}
                          >
                            {label}
                          </div>
                          <div>{value as React.ReactNode}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#777" }}>
                Select children to see details.
              </div>
            )}
          </div>
        </div>
      );
    }

    // Patch is optional (e.g., keep a record of selected child names on the parent row)
    const getRowPatch = () =>
      ({
        childSelections: childChoices.filter(Boolean),
      }) as Partial<TalentRow>;

    // EXTRA ROWS: convert selected children into rows
    const getExtraRows = () => {
      const names = childChoices.filter(Boolean);
      const recs = names
        .map((n) => byName[n])
        .filter(Boolean) as TalentRecord[];
      return recs.map(toRowFromRec);
    };

    return { controls, getRowPatch, getExtraRows };
  };

  const filters: PickerFilter<TalentRecord, any>[] = [typeFilter];

  return (
    <GenericPickerGrid<TalentRecord, TalentRow>
      rows={rows}
      onChange={onChange}
      columns={columns}
      catalogItems={items}
      getItemLabel={(t) => talentLabel(t)} // Name (Requirements)
      getItemKey={(t) => String(t.Name ?? "")}
      getRowCatalogKey={(row) => row.name || null}
      toRow={(t) => toRowFromRec(t)}
      titleAddModal="Add Talent"
      addButtonLabel="+ Add talent"
      previewSections={[
        { label: "Name", value: (t) => t["Name"] },
        { label: "Action", value: (t) => t["Action"] },
        { label: "Requirements", value: (t) => t["Requirements"] },
        { label: "Order", value: (t) => t["Order"] },
        { label: "Race requirements", value: (t) => t["Race requirements"] },
        { label: "Description", value: (t) => t["Description"] },
      ]}
      filters={filters}
      extraPickers={extraPickers}
    />
  );
}

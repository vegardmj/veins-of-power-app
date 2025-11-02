import React, { useMemo, useRef, useState } from "react";
import type { ArmorRow } from "../types";
import { Input, th, td } from "./UI";
import { InfoModal } from "./InfoModal";
import { lines } from "../utils/text";
import { armors as catalogArmors } from "../models/catalog";

const FIELD_W = 120;

// Catalog record is flexible
type ArmorRecord = Record<string, any>;

const PREVIEW_FIELDS = [
  "AC bonus",
  "Penalty",
  "Property",
  "Requirements",
  "Type",
  "Starting?",
];

const Header: React.FC = () => (
  <thead>
    <tr>
      <th style={{ ...th, width: 4 }} />
      <th style={th}>Name</th>
      <th style={{ ...th, width: FIELD_W }}>Type</th>
      <th style={{ ...th, width: FIELD_W }}>AC bonus</th>
      <th style={{ ...th, width: FIELD_W }}>Penalty</th>
      <th style={{ ...th, width: FIELD_W }}>Property</th>
    </tr>
  </thead>
);

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function norm(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

function isStarting(rec: ArmorRecord, want: "Starting" | "Non-starting") {
  const v = String(rec["Starting?"] ?? "")
    .trim()
    .toLowerCase();
  const yes = v === "yes" || v === "y" || v === "true";
  // Also accept "Yes"/"No" literal text
  const literalYes = v === "yes";
  const literalNo = v === "no";
  const finalYes = yes || literalYes || (!literalNo && v === "true");
  return want === "Starting" ? finalYes : !finalYes;
}

function hasType(rec: ArmorRecord, wanted: string) {
  const t = String(rec["Type"] ?? "");
  if (!wanted) return true;
  // Armor Type is typically a single value (Light/Medium/Heavy/Shield)
  return norm(t) === norm(wanted);
}

export function ArmorsGrid({
  rows,
  onChange,
}: {
  rows: ArmorRow[];
  onChange: (r: ArmorRow[]) => void;
}) {
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const set = (idx: number, patch: Partial<ArmorRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as ArmorRow;
    onChange(copy);
  };

  // ---------- Build catalog maps (once) ----------
  const { armorByName, armorNames, allTypes } = useMemo(() => {
    const map: Record<string, ArmorRecord> = {};
    const types = new Set<string>();

    for (const a of catalogArmors) {
      const name = String(a.Name ?? a.name ?? "").trim();
      if (!name) continue;
      map[name] = a;

      const t = String(a["Type"] ?? "").trim();
      if (t) types.add(t);
    }

    const namesSorted = Object.keys(map).sort((x, y) =>
      x.localeCompare(y, undefined, { sensitivity: "base" })
    );
    const typesSorted = Array.from(types).sort((x, y) =>
      x.localeCompare(y, undefined, { sensitivity: "base" })
    );

    return { armorByName: map, armorNames: namesSorted, allTypes: typesSorted };
  }, []);

  // ---------- Add Armor modal state ----------
  const [addOpen, setAddOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string>("");

  // Filters (no "All" option)
  const [startingFilter, setStartingFilter] = useState<
    "Starting" | "Non-starting"
  >("Starting");
  const [typeFilter, setTypeFilter] = useState<string>(""); // blank = no type filter

  const openAddModal = () => {
    setStartingFilter("Starting");
    setTypeFilter("");
    setSelectedName("");
    setAddOpen(true);
  };

  const onSaveAdd = () => {
    if (!selectedName) return;
    const rec = armorByName[selectedName];
    if (!rec) return;

    const next: ArmorRow = {
      name: rec["Name"] ?? "",
      type: rec["Type"] ?? "",
      acBonus: rec["AC bonus"] ?? "",
      penalty: rec["Penalty"] ?? "",
      property: rec["Property"] ?? "",
      requirements: rec["Requirements"] ?? "",
      starting: rec["Starting?"] ?? "",
    };
    onChange([...(rows || []), next]);
    setAddOpen(false);
  };
  const onCancelAdd = () => setAddOpen(false);

  // ---------- DnD ----------
  const onDragStart = (idx: number, e: React.DragEvent<HTMLSpanElement>) => {
    dragIndexRef.current = idx;
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (idx: number, e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== idx) setOverIndex(idx);
  };
  const onDrop = (idx: number, e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    setOverIndex(null);
    dragIndexRef.current = null;
    if (from == null || from === idx) return;
    onChange(move(rows, from, idx));
  };
  const onDragEnd = () => {
    setOverIndex(null);
    dragIndexRef.current = null;
  };

  // ---------- Filtered list for modal ----------
  const filteredNames = useMemo(() => {
    return armorNames.filter((n) => {
      const rec = armorByName[n];
      if (!rec) return false;
      if (!isStarting(rec, startingFilter)) return false;
      if (typeFilter && !hasType(rec, typeFilter)) return false;
      return true;
    });
  }, [armorNames, armorByName, startingFilter, typeFilter]);

  const selected = selectedName ? (armorByName[selectedName] ?? null) : null;

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <Header />
        <tbody>
          {(rows || []).map((r, idx) => (
            <tr
              key={idx}
              onDragOver={(e) => onDragOver(idx, e)}
              onDrop={(e) => onDrop(idx, e)}
              onDragEnd={onDragEnd}
              style={{
                outline: overIndex === idx ? "2px dashed #aaa" : undefined,
                background: overIndex === idx ? "#fafafa" : undefined,
              }}
            >
              <td style={{ ...td, width: 28, paddingLeft: 6, paddingRight: 6 }}>
                <span
                  role="button"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                  draggable
                  onDragStart={(e) => onDragStart(idx, e)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    cursor: "grab",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
                    ⠿
                  </span>
                </span>
              </td>

              <td style={td}>
                <Input
                  value={r.name}
                  onChange={(e) => set(idx, { name: e.target.value })}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.type ?? ""}
                  onChange={(e) => set(idx, { type: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.acBonus ?? ""}
                  onChange={(e) => set(idx, { acBonus: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.penalty ?? ""}
                  onChange={(e) => set(idx, { penalty: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.property ?? ""}
                  onChange={(e) => set(idx, { property: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={openAddModal}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          + Add armor
        </button>
      </div>

      {/* Picker modal */}
      <InfoModal open={addOpen} title="Add Armor" onClose={onCancelAdd}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Starting filter (required) */}
          <label style={{ fontSize: 13, fontWeight: 600 }}>Availability</label>
          <select
            value={startingFilter}
            onChange={(e) =>
              setStartingFilter(e.target.value as "Starting" | "Non-starting")
            }
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              maxWidth: 240,
            }}
          >
            <option value="Starting">Starting</option>
            <option value="Non-starting">Non-starting</option>
          </select>

          {/* Type filter (optional; no "All") */}
          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Armor type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "6px 8px",
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

          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Select armor
          </label>
          <select
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              maxWidth: 420,
            }}
          >
            <option value="">— Choose —</option>
            {filteredNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Info panel for chosen armor */}
          <div
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}
          >
            {selected ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
                    Name
                  </div>
                  <div>{selected["Name"]}</div>
                </div>
                {PREVIEW_FIELDS.map((f) => {
                  const v = selected[f];
                  if (v == null || v === "") return null;
                  return (
                    <div key={f}>
                      <div
                        style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}
                      >
                        {f}
                      </div>
                      <div>{lines(String(v))}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#777" }}>
                Pick an armor to preview details.
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onCancelAdd}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fafafa",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveAdd}
              disabled={!selected}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #4a7",
                background: "#eaffea",
                cursor: selected ? "pointer" : "not-allowed",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </InfoModal>
    </>
  );
}

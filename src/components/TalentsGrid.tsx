import React, { useMemo, useRef, useState } from "react";
import type { TalentRow } from "../types";
import { Input, th, td } from "./UI";
import { InfoModal } from "./InfoModal";
import { lines } from "../utils/text";
import { talents as catalogTalents } from "../models/catalog";

const FIELD_W = 120;

// Accept any fields from talents.json
type TalentRecord = Record<string, any>;

const INFO_FIELDS = [
  "Description",
  "Action",
  "Mana",
  "Order",
  "Requirements",
  "Race requirements",
];

const Header: React.FC = () => (
  <thead>
    <tr>
      <th style={{ ...th, width: 4 }} />
      <th style={th}>Name</th>
      <th style={{ ...th, width: FIELD_W }}>Action</th>
      <th style={th}>Description</th>
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

function tableOf(rec: TalentRecord) {
  return norm(rec.Table ?? rec.table);
}

// Match by selected type using the "Table" field
function matchesType(rec: TalentRecord, selectedType: "Main" | "Secondary") {
  if (!selectedType) return true;
  const want = norm(selectedType);
  return tableOf(rec) === want;
}

export function TalentsGrid({
  rows,
  onChange,
}: {
  rows: TalentRow[];
  onChange: (r: TalentRow[]) => void;
}) {
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const set = (idx: number, patch: Partial<TalentRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as TalentRow;
    onChange(copy);
  };

  // ---------- Build catalog maps (once) ----------
  const { talentByName, talentNames } = useMemo(() => {
    const map: Record<string, TalentRecord> = {};
    for (const t of catalogTalents) {
      const name = String(t.Name ?? t.name ?? "").trim();
      if (!name) continue;
      map[name] = t;
    }
    const namesSorted = Object.keys(map).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return { talentByName: map, talentNames: namesSorted };
  }, []);

  // ---------- Add Talent modal state ----------
  const [addOpen, setAddOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"Main" | "Secondary">(
    "Main"
  );

  const openAddModal = () => {
    setSelectedType("Main");
    setSelectedName("");
    setAddOpen(true);
  };

  const onSaveAdd = () => {
    if (!selectedName) return;
    const rec = talentByName[selectedName];
    if (!rec) return;

    const next: TalentRow = {
      name: rec["Name"] ?? "",
      action: rec["Action"] ?? "",
      description: rec["Description"] ?? "",
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
  const filteredNames = useMemo(
    () => talentNames.filter((n) => matchesType(talentByName[n], selectedType)),
    [talentNames, talentByName, selectedType]
  );

  const onTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const nextType = e.target.value as "Main" | "Secondary";
    setSelectedType(nextType);
    if (selectedName && !matchesType(talentByName[selectedName], nextType)) {
      setSelectedName("");
    }
  };

  const selected = selectedName ? (talentByName[selectedName] ?? null) : null;

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
                  value={r.action ?? ""}
                  onChange={(e) => set(idx, { action: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.description}
                  onChange={(e) => set(idx, { description: e.target.value })}
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
          + Add talent
        </button>
      </div>

      {/* Picker modal */}
      <InfoModal open={addOpen} title="Add Talent" onClose={onCancelAdd}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Type filter */}
          <label style={{ fontSize: 13, fontWeight: 600 }}>Type</label>
          <select
            value={selectedType}
            onChange={onTypeChange}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              maxWidth: 240,
            }}
          >
            <option value="Main">Main</option>
            <option value="Secondary">Secondary</option>
          </select>

          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Select talent ({selectedType})
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

          {/* Info panel for the chosen talent */}
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
                {INFO_FIELDS.map((f) => {
                  const v = selected[f];
                  if (!v) return null;
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
                Pick a talent to preview details.
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

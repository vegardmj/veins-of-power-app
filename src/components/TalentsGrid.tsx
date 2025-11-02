import React, { useEffect, useRef, useState } from "react";
import type { TalentRow } from "../types";
import { Input, th, td } from "./UI";
import { InfoModal } from "./InfoModal";
import { loadJson } from "../api/client";
import { lines } from "../utils/text";

const FIELD_W = 120;

// very flexible: accepts any fields from talents.json
type TalentRecord = Record<string, string>;

const INFO_FIELDS = [
  "Description",
  "Action",
  "Mana",
  "Order",
  "Requirements",
  "Race requirements",
];

const emptyTalent = (): TalentRow => ({
  name: "",
  action: "",
  description: "",
});

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

export function TalentsGrid({
  rows,
  onChange,
}: {
  rows: TalentRow[];
  onChange: (r: TalentRow[]) => void;
}) {
  // ensure some rows exist if empty
  useEffect(() => {
    if (!rows || rows.length === 0)
      onChange([emptyTalent(), emptyTalent(), emptyTalent()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const set = (idx: number, patch: Partial<TalentRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as TalentRow;
    onChange(copy);
  };

  // ---------- Add Talent modal state ----------
  const [addOpen, setAddOpen] = useState(false);
  const [talentNames, setTalentNames] = useState<string[]>([]);
  const [talentByName, setTalentByName] = useState<
    Record<string, TalentRecord>
  >({});
  const [selectedName, setSelectedName] = useState<string>("");

  // lazy-load talents.json when the modal first opens
  const ensureTalentsLoaded = async () => {
    if (talentNames.length > 0) return;
    try {
      const data = await loadJson<unknown>("talents.json");
      const arr = Array.isArray(data) ? (data as any[]) : [];
      const normalized: TalentRecord[] = arr
        .map((x) => (typeof x === "object" && x ? x : {}))
        .map((r) => {
          if (!r["Name"] && (r as any)["name"]) r["Name"] = (r as any)["name"];
          return r as TalentRecord;
        })
        .filter((r) => r["Name"]);
      const map: Record<string, TalentRecord> = {};
      normalized.forEach((r) => {
        map[r["Name"]] = r;
      });
      setTalentByName(map);
      setTalentNames(Object.keys(map).sort());
    } catch (e) {
      console.warn("Failed to load talents.json from /public/data.", e);
      setTalentByName({});
      setTalentNames([]);
    }
  };

  const openAddModal = async () => {
    await ensureTalentsLoaded();
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

  // ---------- DnD for table ----------
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

  // ---------- Render ----------
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
          <label style={{ fontSize: 13, fontWeight: 600 }}>Select talent</label>
          <select
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              maxWidth: 360,
            }}
          >
            <option value="">— Choose —</option>
            {talentNames.map((n) => (
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
                      <div>{lines(v)}</div>
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

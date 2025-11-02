import React, { useMemo, useRef, useState } from "react";
import type { SpellRow } from "../types";
import { Input, th, td } from "./UI";
import { InfoModal } from "./InfoModal";
import { lines } from "../utils/text";
import { spells as catalogSpells } from "../models/catalog";

const NARROW = 110;
type SpellRecord = Record<string, any>;

const INFO_FIELDS = [
  "Ability",
  "Action",
  "Mana",
  "Damage Type",
  "Domain",
  "Duration",
  "Focus",
  "Range",
  "Description",
];

const emptySpell = (): SpellRow => ({
  name: "",
  action: "",
  mana: "",
  range: "",
  duration: "",
  focus: "",
  description: "",
});

// --- helpers for sorting + labels ---
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
function optionLabel(rec: SpellRecord): string {
  const mana = parseMana(rec);
  const manaStr = Number.isFinite(mana) ? String(mana) : "?";
  const name = rec["Name"] ?? "";
  const action = rec["Action"] ?? "";
  const focusTag = hasFocus(rec) ? " (F)" : "";
  // Format: Mana – Name(F) – Action
  return `${manaStr} – ${name}${focusTag} – ${action}`;
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
  if (!a && !d) return true;

  const recAbility = normalize(rec["Ability"] || "");
  const recDomains = String(rec["Domain"] || "")
    .split(",")
    .map((x) => normalize(x))
    .filter(Boolean);

  const abilityOk = a ? recAbility === a : false;
  const domainOk = d ? recDomains.includes(d) : false;

  // OR logic (keep your behavior)
  return abilityOk || domainOk;
}

const Header: React.FC = () => (
  <thead>
    <tr>
      <th style={{ ...th, width: 4 }} />
      <th style={th}>Name</th>
      <th style={{ ...th, width: NARROW }}>Action</th>
      <th style={{ ...th, width: NARROW }}>Mana</th>
      <th style={{ ...th, width: NARROW }}>Range</th>
      <th style={{ ...th, width: NARROW }}>Duration</th>
      <th style={{ ...th, width: NARROW }}>Focus</th>
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

export function SpellsGrid({
  rows,
  onChange,
  filterAbility = "",
  filterDomain = "",
}: {
  rows: SpellRow[];
  onChange: (r: SpellRow[]) => void;
  filterAbility?: string; // "Int" | "Con" | "Cha" | ""
  filterDomain?: string; // one of your DOMAINS or ""
}) {
  // DnD state
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const set = (idx: number, patch: Partial<SpellRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as SpellRow;
    onChange(copy);
  };

  // ---------- Build catalog maps (once) ----------
  const { spellByName, spellNames } = useMemo(() => {
    const map: Record<string, SpellRecord> = {};
    for (const s of catalogSpells) {
      const name = String(s.Name ?? s.name ?? "").trim();
      if (!name) continue;
      map[name] = s;
    }
    // Sort names by: Mana asc, then Name asc
    const namesSorted = Object.keys(map).sort((a, b) => {
      const ra = map[a],
        rb = map[b];
      const ma = parseMana(ra),
        mb = parseMana(rb);
      if (ma !== mb) return ma - mb;
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    });
    return { spellByName: map, spellNames: namesSorted };
  }, []);

  // ---------- Add Spell modal ----------
  const [addOpen, setAddOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  const openAddModal = () => {
    setSelectedName("");
    setAddOpen(true);
  };
  const onCancelAdd = () => setAddOpen(false);

  const onSaveAdd = () => {
    if (!selectedName) return;
    const rec = spellByName[selectedName];
    if (!rec) return;

    const next: SpellRow = {
      name: rec["Name"] ?? "",
      action: rec["Action"] ?? "",
      mana: rec["Mana"] ?? "",
      range: rec["Range"] ?? "",
      duration: rec["Duration"] ?? "",
      focus: rec["Focus"] ?? "",
      description: rec["Description"] ?? "",
    };
    onChange([...(rows || []), next]);
    setAddOpen(false);
  };

  // DnD handlers
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

  const selected = selectedName ? (spellByName[selectedName] ?? null) : null;

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
                  style={{ maxWidth: NARROW }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.mana ?? ""}
                  onChange={(e) => set(idx, { mana: e.target.value })}
                  style={{ maxWidth: NARROW }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.range ?? ""}
                  onChange={(e) => set(idx, { range: e.target.value })}
                  style={{ maxWidth: NARROW }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.duration ?? ""}
                  onChange={(e) => set(idx, { duration: e.target.value })}
                  style={{ maxWidth: NARROW }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.focus ?? ""}
                  onChange={(e) => set(idx, { focus: e.target.value })}
                  style={{ maxWidth: NARROW }}
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
          + Add spell
        </button>
      </div>

      {/* Picker modal */}
      <InfoModal open={addOpen} title="Add Spell" onClose={onCancelAdd}>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Select spell</label>
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
            {spellNames
              .filter((n) =>
                spellMatches(spellByName[n], filterAbility, filterDomain)
              )
              .map((n) => {
                const rec = spellByName[n];
                const label = rec ? optionLabel(rec) : n;
                return (
                  <option key={n} value={n}>
                    {label}
                  </option>
                );
              })}
          </select>

          {/* Info panel */}
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
                Pick a spell to preview details.
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

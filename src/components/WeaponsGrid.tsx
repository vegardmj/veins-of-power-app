import React, { useMemo, useRef, useState } from "react";
import type { WeaponRow } from "../types";
import { Input, th, td } from "./UI";
import { InfoModal } from "./InfoModal";
import { lines } from "../utils/text";
import { weapons as catalogWeapons } from "../models/catalog";

const FIELD_W = 120;

// Catalog record is flexible
type WeaponRecord = Record<string, any>;

const PREVIEW_FIELDS = [
  "dmg",
  "Reach",
  "Ability modifier",
  "Type",
  "1 handed req.",
  "Rarity",
  "Stock mod.",
  "Starting?",
];

const Header: React.FC = () => (
  <thead>
    <tr>
      <th style={{ ...th, width: 4 }} />
      <th style={th}>Name</th>
      <th style={{ ...th, width: FIELD_W }}>Type</th>
      <th style={{ ...th, width: FIELD_W }}>Damage</th>
      <th style={{ ...th, width: FIELD_W }}>Reach</th>
      <th style={{ ...th, width: FIELD_W }}>Ability</th>
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

function hasType(rec: WeaponRecord, wantedToken: string) {
  const raw = String(rec["Type"] ?? "");
  const tokens = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.some((t) => norm(t) === norm(wantedToken));
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
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const set = (idx: number, patch: Partial<WeaponRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as WeaponRow;
    onChange(copy);
  };

  // ---------- Build catalog maps (once) ----------
  const { weaponByName, weaponNames, allTypeTokens } = useMemo(() => {
    const map: Record<string, WeaponRecord> = {};
    const tokenSet = new Set<string>();

    for (const w of catalogWeapons) {
      const name = String(w.Name ?? w.name ?? "").trim();
      if (!name) continue;
      map[name] = w;

      // Gather unique Type tokens
      const raw = String(w["Type"] ?? "");
      for (const t of raw.split(",")) {
        const tok = t.trim();
        if (tok) tokenSet.add(tok);
      }
    }

    const namesSorted = Object.keys(map).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    const tokensSorted = Array.from(tokenSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return {
      weaponByName: map,
      weaponNames: namesSorted,
      allTypeTokens: tokensSorted,
    };
  }, []);

  // ---------- Add Weapon modal state ----------
  const [addOpen, setAddOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string>("");

  // Filters (no "All" option)
  const [startingFilter, setStartingFilter] = useState<
    "Starting" | "Non-starting"
  >("Starting");
  const [typeFilter, setTypeFilter] = useState<string>(""); // blank means not chosen

  const openAddModal = () => {
    setStartingFilter("Starting");
    setTypeFilter("");
    setSelectedName("");
    setAddOpen(true);
  };

  const onSaveAdd = () => {
    if (!selectedName) return;
    const rec = weaponByName[selectedName];
    if (!rec) return;

    const next: WeaponRow = {
      name: rec["Name"] ?? "",
      type: rec["Type"] ?? "",
      dmg: rec["dmg"] ?? "",
      bonus: rec["Bonus"] ?? "",
      reach: rec["Reach"] ?? "",
      ability: rec["Ability modifier"] ?? "",
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
    const names = weaponNames.filter((n) => {
      const rec = weaponByName[n];
      if (!rec) return false;

      // Starting filter (required)
      if (!isStarting(rec, startingFilter)) return false;

      // Type filter (optional: blank = no filter)
      if (typeFilter && !hasType(rec, typeFilter)) return false;

      return true;
    });
    return names;
  }, [weaponNames, weaponByName, startingFilter, typeFilter]);

  const selected = selectedName ? (weaponByName[selectedName] ?? null) : null;

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
                  value={r.dmg ?? ""}
                  onChange={(e) => set(idx, { dmg: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.reach ?? ""}
                  onChange={(e) => set(idx, { reach: e.target.value })}
                  style={{ maxWidth: FIELD_W }}
                />
              </td>
              <td style={td}>
                <Input
                  value={r.ability ?? ""}
                  onChange={(e) => set(idx, { ability: e.target.value })}
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
          + Add weapon
        </button>
      </div>

      {/* Picker modal */}
      <InfoModal open={addOpen} title="Add Weapon" onClose={onCancelAdd}>
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

          {/* Type filter (optional; no "All" option) */}
          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Weapon type
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
            {allTypeTokens.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Select weapon
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

          {/* Info panel for the chosen weapon */}
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
                Pick a weapon to preview details.
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

import React, { useEffect, useRef, useState } from "react";
import type { ActionRow } from "../types";
import { Input, th, td } from "./UI";

// Helper: create an empty row
const emptyRow = (): ActionRow => ({
  ability: "",
  toHit: "",
  damage: "",
  effect: "",
});

// Shared table header for Actions/Bonus Actions/Reactions
const TableHeader: React.FC = () => (
  <thead>
    <tr>
      <th style={{ ...th, width: 4 }} />
      <th style={th}>Ability</th>
      <th style={th}>To Hit</th>
      <th style={th}>Damage</th>
      <th style={th}>Effect</th>
    </tr>
  </thead>
);

// Utility to move array item from one index to another
function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// Generic grid that both Actions and Reactions can use
function EditableGrid({
  rows,
  onChange,
  addLabel = "+ Add row",
}: {
  rows: ActionRow[];
  onChange: (r: ActionRow[]) => void;
  addLabel?: string;
}) {
  // Initialize to 3 rows by default if empty/undefined
  useEffect(() => {
    if (!rows || rows.length === 0) {
      onChange([emptyRow(), emptyRow(), emptyRow()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const set = (idx: number, patch: Partial<ActionRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as ActionRow;
    onChange(copy);
  };

  const addRow = () => onChange([...(rows || []), emptyRow()]);

  const onDragStart = (idx: number, e: React.DragEvent<HTMLSpanElement>) => {
    dragIndexRef.current = idx;
    e.dataTransfer.setData("text/plain", String(idx)); // required for FF
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (idx: number, e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault(); // allow drop
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

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <TableHeader />
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
              {/* Drag handle cell */}
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
                  {/* drag glyph */}
                  <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
                    ⠿
                  </span>
                </span>
              </td>

              <td style={td}>
                <Input
                  value={r.ability}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set(idx, { ability: e.target.value })
                  }
                />
              </td>
              <td style={td}>
                <Input
                  value={r.toHit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set(idx, { toHit: e.target.value })
                  }
                />
              </td>
              <td style={td}>
                <Input
                  value={r.damage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set(idx, { damage: e.target.value })
                  }
                />
              </td>
              <td style={td}>
                <Input
                  value={r.effect}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set(idx, { effect: e.target.value })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={addRow}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          {addLabel}
        </button>
      </div>
    </>
  );
}

// === Public components ===
export function ActionsGrid({
  rows,
  onChange,
}: {
  rows: ActionRow[];
  onChange: (r: ActionRow[]) => void;
}) {
  return (
    <EditableGrid rows={rows} onChange={onChange} addLabel="+ Add action" />
  );
}

export function ReactionsGrid({
  rows,
  onChange,
}: {
  rows: ActionRow[];
  onChange: (r: ActionRow[]) => void;
}) {
  return (
    <EditableGrid rows={rows} onChange={onChange} addLabel="+ Add reaction" />
  );
}

export function SpecialsGrid({
  rows,
  onChange,
}: {
  rows: ActionRow[];
  onChange: (r: ActionRow[]) => void;
}) {
  return (
    <EditableGrid rows={rows} onChange={onChange} addLabel="+ Add special" />
  );
}

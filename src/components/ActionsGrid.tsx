import React, { useEffect } from "react";
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
      <th style={th}>Ability</th>
      <th style={th}>To Hit</th>
      <th style={th}>Damage</th>
      <th style={th}>Effect</th>
    </tr>
  </thead>
);

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
    // Only run when rows array reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const set = (idx: number, patch: Partial<ActionRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch } as ActionRow;
    onChange(copy);
  };

  const addRow = () => onChange([...(rows || []), emptyRow()]);

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <TableHeader />
        <tbody>
          {(rows || []).map((r, idx) => (
            <tr key={idx}>
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

      <div style={{ marginTop: 8 }}>
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

import type { ActionRow } from "../types";
import { Input, th, td } from "./UI";

export function ActionsGrid({
  rows,
  onChange,
}: {
  rows: ActionRow[];
  onChange: (r: ActionRow[]) => void;
}) {
  const set = (idx: number, patch: Partial<ActionRow>) => {
    const copy = [...rows];
    copy[idx] = { ...copy[idx], ...patch };
    onChange(copy);
  };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Ability</th>
          <th style={th}>To Hit</th>
          <th style={th}>Damage</th>
          <th style={th}>Effect</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={idx}>
            <td style={td}>
              <Input
                value={r.ability}
                onChange={(e) => set(idx, { ability: e.target.value })}
              />
            </td>
            <td style={td}>
              <Input
                value={r.toHit}
                onChange={(e) => set(idx, { toHit: e.target.value })}
              />
            </td>
            <td style={td}>
              <Input
                value={r.damage}
                onChange={(e) => set(idx, { damage: e.target.value })}
              />
            </td>
            <td style={td}>
              <Input
                value={r.effect}
                onChange={(e) => set(idx, { effect: e.target.value })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

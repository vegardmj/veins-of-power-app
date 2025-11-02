import React, { useEffect, useState } from "react";
import type { AbilityKey, Character } from "../types";
import { abilityKeys } from "../constants";
import { Input, td, tdHead, th } from "./UI";
import { calcMod } from "../utils/math";

type Drafts = Record<AbilityKey, number | "">;

function formatSigned(n: number | ""): string {
  if (n === "" || typeof n !== "number" || !Number.isFinite(n)) return "";
  return n >= 0 ? `+${n}` : `${n}`;
}

export function AbilityTable({
  ch,
  setCh,
}: {
  ch: Character;
  setCh: React.Dispatch<React.SetStateAction<Character>>;
}) {
  // Local draft for Base (commit on blur)
  const [draftBase, setDraftBase] = useState<Drafts>(() => {
    const d = {} as Drafts;
    for (const k of abilityKeys) d[k] = ch.abilities[k].base;
    return d;
  });

  useEffect(() => {
    setDraftBase((prev) => {
      const next = { ...prev };
      for (const k of abilityKeys) next[k] = ch.abilities[k].base;
      return next;
    });
  }, [ch.abilities]);

  const setBaseCommit = (k: AbilityKey, baseVal: number | "") => {
    const newMod = calcMod(baseVal);
    setCh((prev) => {
      const prevRow = prev.abilities[k];
      const nextSave = prevRow.save === "" ? newMod : prevRow.save; // only auto-fill if blank
      return {
        ...prev,
        abilities: {
          ...prev.abilities,
          [k]: { base: baseVal, mod: newMod, save: nextSave },
        },
      };
    });
  };

  const setSave = (k: AbilityKey, saveVal: number | "") => {
    setCh((prev) => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [k]: { ...prev.abilities[k], save: saveVal },
      },
    }));
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Ability</th>
            {abilityKeys.map((k) => (
              <th key={k} style={th}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Base (drafted, commit onBlur) */}
          <tr>
            <td style={tdHead}>Base</td>
            {abilityKeys.map((k) => (
              <td key={k} style={td}>
                <Input
                  type="number"
                  value={draftBase[k]}
                  style={{ maxWidth: 80 }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const v = raw === "" ? "" : Number(raw);
                    setDraftBase((d) => ({
                      ...d,
                      [k]: raw === "" ? "" : Number.isNaN(v) ? "" : v,
                    }));
                  }}
                  onBlur={() => {
                    const v = draftBase[k];
                    setBaseCommit(k, v === "" ? "" : v);
                  }}
                />
              </td>
            ))}
          </tr>

          {/* Modifier (read-only, signed, from draft) */}
          <tr>
            <td style={tdHead}>Modifier</td>
            {abilityKeys.map((k) => {
              const mod = calcMod(draftBase[k]);
              return (
                <td key={k} style={td}>
                  <Input
                    type="text"
                    value={formatSigned(mod)}
                    style={{ maxWidth: 80 }}
                    readOnly
                    disabled
                    title="Auto-calculated on blur: floor((Base - 10) / 2)"
                  />
                </td>
              );
            })}
          </tr>

          {/* Save (editable, signed; if blank, shows current mod) */}
          <tr>
            <td style={tdHead}>Save</td>
            {abilityKeys.map((k) => {
              const modFromDraft = calcMod(draftBase[k]);
              const current =
                ch.abilities[k].save === ""
                  ? modFromDraft
                  : ch.abilities[k].save;
              return (
                <td key={k} style={td}>
                  <Input
                    type="text"
                    value={formatSigned(current)}
                    style={{ maxWidth: 80 }}
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      if (raw === "") {
                        setSave(k, "");
                        return;
                      } // blank -> fall back to mod
                      const n = Number(raw); // accepts "+3" or "-2"
                      setSave(k, Number.isNaN(n) ? "" : n);
                    }}
                  />
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

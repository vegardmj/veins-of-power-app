import React from "react";
import type { Character } from "../types";
import { Label, Select, Input } from "./UI";
import { DOMAINS } from "../constants";
import { calcMod } from "../utils/math";

function formatSigned(n: number | ""): string {
  if (n === "" || typeof n !== "number" || !Number.isFinite(n)) return "";
  return n >= 0 ? `+${n}` : `${n}`;
}

export function SpellcastingBlock({
  ch,
  setCh,
}: {
  ch: Character;
  setCh: React.Dispatch<React.SetStateAction<Character>>;
}) {
  const sc = ch.spellcasting ?? { ability: "", domain: "", spellAttack: "" };

  const mod = (() => {
    const a = sc.ability;
    if (!a) return "";
    const row = ch.abilities[a];
    const m = row?.mod === "" ? calcMod(row?.base ?? "") : row?.mod;
    return typeof m === "number" ? m : "";
  })();

  const dc = typeof mod === "number" ? 10 + mod : "";

  const setSC = (patch: Partial<typeof sc>) =>
    setCh((prev) => ({
      ...prev,
      spellcasting: { ...(prev.spellcasting ?? sc), ...patch },
    }));

  const onAbilityChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const ability = e.target.value as "Int" | "Con" | "Cha" | "";
    let nextAttack = sc.spellAttack;
    if (nextAttack === "" && ability) {
      const row = ch.abilities[ability];
      const m = row?.mod === "" ? calcMod(row?.base ?? "") : row?.mod;
      nextAttack = typeof m === "number" ? m : "";
    }
    setSC({ ability, spellAttack: nextAttack });
  };

  const onDomainChange: React.ChangeEventHandler<HTMLSelectElement> = (e) =>
    setSC({ domain: e.target.value });

  // accept "+3", "-1", "3", blank
  const onAttackChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value.trim();
    if (raw === "") return setSC({ spellAttack: "" });
    const n = Number(raw);
    setSC({ spellAttack: Number.isNaN(n) ? "" : n });
  };

  return (
    <div
      style={{
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <Label>Ability</Label>
          <Select value={sc.ability} onChange={onAbilityChange}>
            <option value="">—</option>
            <option value="Int">Int</option>
            <option value="Con">Con</option>
            <option value="Cha">Cha</option>
          </Select>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <Label>Domain</Label>
          <Select value={sc.domain} onChange={onDomainChange}>
            <option value="">—</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>

        {/* Modifier (read-only, signed) */}
        <div style={{ gridColumn: "span 2" }}>
          <Label>Modifier</Label>
          <Input
            type="text"
            value={formatSigned(mod)}
            readOnly
            disabled
            style={{ maxWidth: 120 }}
          />
        </div>

        {/* Spell Attack (editable, signed display) */}
        <div style={{ gridColumn: "span 2" }}>
          <Label>Spell Attack</Label>
          <Input
            type="text"
            value={formatSigned(sc.spellAttack)}
            onChange={onAttackChange}
            style={{ maxWidth: 120 }}
          />
        </div>

        {/* DC stays numeric (no + requested) */}
        <div style={{ gridColumn: "span 3" }}>
          <Label>Spell Save DC</Label>
          <Input
            type="number"
            value={dc === "" ? "" : dc}
            readOnly
            disabled
            style={{ maxWidth: 140 }}
          />
        </div>
      </div>
    </div>
  );
}

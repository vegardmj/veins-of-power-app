// src/components/SkillsGrid.tsx
import React, { useState } from "react";
import type { Character, AbilityKey } from "../types";
import { SKILLS } from "../constants";
import { Row, Col, Label, Input } from "./UI";
import { calcMod } from "../utils/math";

const FIELD_WIDTH = 40; // px

// Render a saved numeric value with a leading "+" for non-negative numbers
function formatSigned(n: number | ""): string {
  if (n === "" || typeof n !== "number" || !Number.isFinite(n)) return "";
  return n >= 0 ? `+${n}` : `${n}`;
}

// While typing, allow "", "+", "-", and digits (optionally with one leading sign)
const isTypingValid = (s: string) => /^[-+]?\d*$/.test(s);

// Some older data might have a string stored; normalize to number | ""
function coerceBonus(val: number | string | ""): number | "" {
  if (val === "") return "";
  if (typeof val === "number") return Number.isFinite(val) ? val : "";
  // string
  const n = Number(String(val).trim());
  return Number.isFinite(n) ? n : "";
}

export function SkillsGrid({
  ch,
  setCh,
}: {
  ch: Character;
  setCh: React.Dispatch<React.SetStateAction<Character>>;
}) {
  // Per-row raw editing text so users can type "+" or "-" before a digit
  const [editing, setEditing] = useState<Record<number, string>>({});

  // Committed ability modifier
  const abilityMod = (ability: AbilityKey): number => {
    const row = ch.abilities[ability];
    const mod = row.mod === "" ? calcMod(row.base) : row.mod;
    return typeof mod === "number" ? mod : 0;
  };

  const setBonus = (idx: number, val: number | "") => {
    setCh((prev) => {
      const copy = [...prev.skills];
      copy[idx] = { ...copy[idx], bonus: val };
      return { ...prev, skills: copy };
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
      {ch.skills.map((s, i) => {
        const mod = abilityMod(s.ability);
        const committedBonus = coerceBonus(s.bonus);
        const total =
          (typeof committedBonus === "number" ? committedBonus : 0) + mod;

        // If the user is currently typing, show that raw string; otherwise show formatted committed value
        const displayValue = editing[i] ?? formatSigned(committedBonus);

        return (
          <div
            key={s.key}
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 6 }}
          >
            <Row gap={1}>
              <Col span={5}>
                <Label>Skill</Label>
                <Input
                  value={SKILLS.find((k) => k.key === s.key)?.label ?? s.key}
                  style={{ width: 160 }}
                  readOnly
                  disabled
                />
              </Col>

              <Col span={2}>
                <Label>Bonus</Label>
                <div style={{ width: FIELD_WIDTH }}>
                  <Input
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                      const raw = e.target.value.trim();

                      // Only accept strings like "", "+", "-", "+12", "-3", "4"
                      if (!isTypingValid(raw)) return;

                      // Track raw text while editing
                      setEditing((prev) => ({ ...prev, [i]: raw }));

                      // If it's a complete number, commit it; otherwise keep model as empty for now
                      if (raw !== "" && raw !== "+" && raw !== "-") {
                        const n = Number(raw);
                        if (Number.isFinite(n)) setBonus(i, n);
                      } else {
                        setBonus(i, "");
                      }
                    }}
                    onBlur={() => {
                      const raw = (editing[i] ?? "").trim();

                      if (raw === "" || raw === "+" || raw === "-") {
                        setBonus(i, "");
                      } else {
                        const n = Number(raw);
                        setBonus(i, Number.isFinite(n) ? n : "");
                      }

                      // Clear the per-row editing buffer
                      setEditing((prev) => {
                        const { [i]: _omit, ...rest } = prev;
                        return rest;
                      });
                    }}
                    inputMode="decimal"
                    pattern="[-+]?\d*"
                    placeholder="+0"
                  />
                </div>
              </Col>

              <Col span={3}>
                <Label>Total</Label>
                <div style={{ width: FIELD_WIDTH }}>
                  <Input
                    type="text"
                    value={formatSigned(total)}
                    readOnly
                    disabled
                  />
                </div>
              </Col>
            </Row>
          </div>
        );
      })}
    </div>
  );
}

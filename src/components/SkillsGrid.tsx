import type { Character, AbilityKey } from "../types";
import { SKILLS } from "../constants";
import { Row, Col, Label, Input } from "./UI";
import { calcMod } from "../utils/math";

const FIELD_WIDTH = 40; // px

function formatSigned(n: number | ""): string {
  if (n === "" || typeof n !== "number" || !Number.isFinite(n)) return "";
  return n >= 0 ? `+${n}` : `${n}`;
}

export function SkillsGrid({
  ch,
  setCh,
}: {
  ch: Character;
  setCh: React.Dispatch<React.SetStateAction<Character>>;
}) {
  // committed ability modifier
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
        const bonus =
          typeof s.bonus === "number"
            ? s.bonus
            : s.bonus === ""
              ? ""
              : Number(s.bonus);
        const total = (typeof bonus === "number" ? bonus : 0) + mod;

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
                    // use text to allow leading "+"
                    type="text"
                    value={formatSigned(bonus)}
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      if (raw === "") {
                        setBonus(i, "");
                        return;
                      }
                      const n = Number(raw); // handles "+3", "-2"
                      setBonus(i, Number.isNaN(n) ? "" : n);
                    }}
                    inputMode="numeric"
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

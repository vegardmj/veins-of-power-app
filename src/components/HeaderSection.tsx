// src/components/HeaderSection.tsx
import React from "react";
import type { Character } from "../types";
import { TALENTS } from "../constants";
import { Row, Col, Label, Input, Select } from "./UI";

type Props = {
  ch: Character;
  raceNames: string[];
  onChange: (key: keyof Character, value: any) => void;
  onOpenRaceInfo: () => void;
};

export function HeaderSection({
  ch,
  raceNames,
  onChange,
  onOpenRaceInfo,
}: Props) {
  const race = ch.raceTalent.split(" | ")[0] ?? "";
  const talent = ch.raceTalent.split(" | ")[1] ?? "";

  const handleRaceChange = (value: string) => {
    const t = talent || "";
    onChange("raceTalent", `${value}${t ? " | " + t : ""}`);
  };

  const handleTalentChange = (value: string) => {
    const r = race || "";
    onChange("raceTalent", `${r}${value ? " | " + value : ""}`);
  };

  const narrowNumberStyle: React.CSSProperties = {
    width: 120,
  };

  return (
    <Row>
      <Col span={6}>
        <Label>Name</Label>
        <Input
          value={ch.name}
          onChange={(e) => onChange("name", e.target.value)}
          style={{ width: 350 }}
        />
      </Col>

      <Col span={6}>
        {/* Label row with help icon on the right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Label>Race &amp; Talent</Label>
          {race && (
            <button
              title="Show race info"
              aria-label="Show race info"
              onClick={onOpenRaceInfo}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                padding: 2,
                color: "#666",
              }}
            >
              {/* simple help icon without extra deps */}ⓘ
            </button>
          )}
        </div>

        {/* Selects */}
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <Select
            value={race}
            onChange={(e) => handleRaceChange(e.target.value)}
          >
            <option value="">— Race —</option>
            {raceNames.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>

          <Select
            value={talent}
            onChange={(e) => handleTalentChange(e.target.value)}
          >
            <option value="">— Race Talent —</option>
            {TALENTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </Col>

      <Col span={3}>
        <Label>Level</Label>
        <Input
          type="number"
          value={ch.level}
          onChange={(e) => onChange("level", Number(e.target.value) || "")}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={3}>
        <Label>Age</Label>
        <Input
          type="number"
          value={ch.age}
          onChange={(e) => onChange("age", Number(e.target.value) || "")}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={3}>
        <Label>Speed</Label>
        <Input
          type="number"
          value={ch.speed}
          onChange={(e) => onChange("speed", Number(e.target.value) || "")}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={3}>
        <Label>Gender</Label>
        <Input
          value={ch.gender}
          onChange={(e) => onChange("gender", e.target.value)}
          style={narrowNumberStyle}
        />
      </Col>

      <Col span={3}>
        <Label>Initiative</Label>
        <Input
          type="number"
          value={ch.initiative}
          onChange={(e) => onChange("initiative", Number(e.target.value) || "")}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={3}>
        <Label>Armor Class</Label>
        <Input
          type="number"
          value={ch.armorClass}
          onChange={(e) => onChange("armorClass", Number(e.target.value) || "")}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={3}>
        <Label>Occupation</Label>
        <Input
          value={ch.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={3}>
        <Label>Patron</Label>
        <Input
          value={ch.patron}
          onChange={(e) => onChange("patron", e.target.value)}
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={2}>
        <Label>Max HP</Label>
        <Input
          type="number"
          value={ch.maxHP}
          onChange={(e) => onChange("maxHP", Number(e.target.value) || "")}
          // narrower
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={9}>
        <Label>Current HP</Label>
        <Input
          type="number"
          value={ch.curHP}
          onChange={(e) => onChange("curHP", Number(e.target.value) || "")}
        />
      </Col>
      <Col span={2}>
        <Label>Max Mana</Label>
        <Input
          type="number"
          value={ch.maxMana}
          onChange={(e) => onChange("maxMana", Number(e.target.value) || "")}
          // narrower
          style={narrowNumberStyle}
        />
      </Col>
      <Col span={9}>
        <Label>Current Mana</Label>
        <Input
          type="number"
          value={ch.curMana}
          onChange={(e) => onChange("curMana", Number(e.target.value) || "")}
        />
      </Col>
    </Row>
  );
}

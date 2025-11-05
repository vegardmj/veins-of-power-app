import { useEffect, useState } from "react";
import type { Character } from "./types";
import { InfoModal } from "./components/InfoModal";
import { RaceInfo } from "./components/RaceInfo";
import { emptyCharacter, loadCharacter, saveCharacter } from "./storage";
import { Section, Button } from "./components/UI";
import { AbilityTable } from "./components/AbilityTable";
import { SkillsGrid } from "./components/SkillsGrid";
import { ActionsGrid } from "./components/ActionsGrid";
import { HeaderSection } from "./components/HeaderSection";
import { TalentsGrid } from "./components/TalentsGrid";
import { SpellsGrid } from "./components/SpellsGrid";
import { SpellcastingBlock } from "./components/SpellcastingBlock";
import { WeaponsGrid } from "./components/WeaponsGrid";
import { ArmorsGrid } from "./components/ArmorsGrid";

import {
  raceByName as catalogRaceByName,
  raceNamesFromJson,
} from "./models/catalog";

export default function App() {
  const [ch, setCh] = useState<Character>(
    () => loadCharacter() ?? emptyCharacter()
  );
  const [autosave, setAutosave] = useState(true);
  const [raceModalOpen, setRaceModalOpen] = useState(false);

  // Derived once from catalog
  const raceNames = raceNamesFromJson;

  useEffect(() => {
    if (autosave) saveCharacter(ch);
  }, [ch, autosave]);

  const update = <K extends keyof Character>(key: K, value: Character[K]) =>
    setCh((prev) => ({ ...prev, [key]: value }));

  const reset = () => setCh(emptyCharacter());

  const currentRaceName = ch.raceTalent.split(" | ")[0] || "";
  const currentRaceRec = catalogRaceByName.get(currentRaceName) ?? null;

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "20px auto",
        padding: "0 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Veins of Power</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={autosave}
              onChange={(e) => setAutosave(e.target.checked)}
            />{" "}
            Autosave
          </label>
          <Button onClick={() => window.print()}>Print</Button>
          <Button onClick={reset}>New</Button>
        </div>
      </header>

      {/* Header block */}
      <Section>
        <HeaderSection
          ch={ch}
          raceNames={raceNames}
          onChange={(key, value) => update(key as any, value as any)}
          onOpenRaceInfo={() => setRaceModalOpen(true)}
        />
      </Section>

      <Section title="Ability Scores">
        <AbilityTable ch={ch} setCh={setCh} />
      </Section>

      <Section title="Skills">
        <SkillsGrid ch={ch} setCh={setCh} />
      </Section>

      <Section title="Attacks and Actions">
        <label>Actions</label>
        <ActionsGrid rows={ch.actions} onChange={(r) => update("actions", r)} />
        <div style={{ height: 8 }} />
        <label>Supporting Actions</label>
        <ActionsGrid
          rows={ch.supportActions}
          onChange={(r) => update("supportActions", r)}
        />
        <div style={{ height: 8 }} />
        <label>Reactions</label>
        <ActionsGrid
          rows={ch.reactions}
          onChange={(r) => update("reactions", r)}
        />
        <div style={{ height: 8 }} />
        <label>Specials</label>
        <ActionsGrid
          rows={ch.specials}
          onChange={(r) => update("specials", r)}
        />
      </Section>

      <Section title="Talents">
        <TalentsGrid rows={ch.talents} onChange={(r) => update("talents", r)} />
      </Section>

      <Section title="Spellcasting">
        <SpellcastingBlock ch={ch} setCh={setCh} />
      </Section>
      <Section title="Spells">
        <SpellsGrid
          rows={ch.spells}
          onChange={(r) => update("spells", r)}
          filterAbility={ch.spellcasting?.ability ?? ""}
          filterDomain={ch.spellcasting?.domain ?? ""}
        />
      </Section>

      <Section title="Weapons">
        <WeaponsGrid rows={ch.weapons} onChange={(r) => update("weapons", r)} />
      </Section>

      <Section title="Armors">
        <ArmorsGrid rows={ch.armors} onChange={(r) => update("armors", r)} />
      </Section>

      <InfoModal
        open={raceModalOpen}
        title={currentRaceName || "Race"}
        onClose={() => setRaceModalOpen(false)}
      >
        <RaceInfo
          race={currentRaceRec}
          talentName={ch.raceTalent.split(" | ")[1] || ""} // ← pass selected talent
        />
      </InfoModal>
    </main>
  );
}

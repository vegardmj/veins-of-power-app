import { useEffect, useState } from "react";
import type { Character } from "./types";
import { TALENTS, DOMAINS } from "./constants";
import type { RaceRecord } from "./types";
import { InfoModal } from "./components/InfoModal";
import { RaceInfo } from "./components/RaceInfo";
import { loadJson } from "./api/client";
import { emptyCharacter, loadCharacter, saveCharacter } from "./storage";
import {
  Section,
  Row,
  Col,
  Label,
  Input,
  Select,
  Textarea,
  Button,
  th,
  td,
} from "./components/UI";
import { AbilityTable } from "./components/AbilityTable";
import { SkillsGrid } from "./components/SkillsGrid";
import { ActionsGrid } from "./components/ActionsGrid";
import { HeaderSection } from "./components/HeaderSection";

export default function App() {
  const [ch, setCh] = useState<Character>(
    () => loadCharacter() ?? emptyCharacter()
  );
  const [autosave, setAutosave] = useState(true);
  const [raceNames, setRaceNames] = useState<string[]>([]);
  const [raceByName, setRaceByName] = useState<Record<string, RaceRecord>>({});
  const [raceModalOpen, setRaceModalOpen] = useState(false);

  useEffect(() => {
    if (autosave) saveCharacter(ch);
  }, [ch, autosave]);

  // Load races.json
  useEffect(() => {
    (async () => {
      try {
        const data = await loadJson<unknown>("races.json");
        // Expect array of objects with a "Name" field. We’ll be permissive.
        const arr = Array.isArray(data) ? (data as any[]) : [];
        const normalized: RaceRecord[] = arr
          .map((x) => (typeof x === "object" && x ? x : {}))
          .map((r) => {
            // Also accept "name" (lowercase) by normalizing:
            if (!r["Name"] && r["name"]) r["Name"] = r["name"];
            return r as RaceRecord;
          })
          .filter((r) => r["Name"]);
        const map: Record<string, RaceRecord> = {};
        normalized.forEach((r) => {
          map[r["Name"]] = r;
        });
        setRaceByName(map);
        setRaceNames(Object.keys(map).sort());
      } catch (e) {
        console.error("Could not load races.json.", e);
        const fallback = [
          "Human",
          "Elf",
          "Dwarf",
          "Halfling",
          "Half-Giant",
          "Gnome",
        ];
        setRaceNames(fallback);
        setRaceByName(
          Object.fromEntries(fallback.map((n) => [n, { Name: n }]))
        );
      }
    })();
  }, []);

  const update = <K extends keyof Character>(key: K, value: Character[K]) =>
    setCh((prev) => ({ ...prev, [key]: value }));

  const reset = () => setCh(emptyCharacter());

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(ch, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ch.name || "character"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setCh(JSON.parse(String(reader.result)));
      } catch {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

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
          {/* <Button onClick={exportJson}>Export JSON</Button>
          <label style={{ cursor: "pointer" }}>
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
              }}
              style={{ display: "none" }}
            />
            <span
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #bbb",
                background: "#f7f7f7",
              }}
            >
              Import JSON
            </span>
          </label> */}
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Ability</th>
              <th style={th}>Effect</th>
            </tr>
          </thead>
          <tbody>
            {ch.reactions.map((r, i) => (
              <tr key={i}>
                <td style={td}>
                  <Input
                    value={r.ability}
                    onChange={(e) => {
                      const copy = [...ch.reactions];
                      copy[i] = { ...r, ability: e.target.value };
                      update("reactions", copy);
                    }}
                  />
                </td>
                <td style={td}>
                  <Input
                    value={r.effect}
                    onChange={(e) => {
                      const copy = [...ch.reactions];
                      copy[i] = { ...r, effect: e.target.value };
                      update("reactions", copy);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <InfoModal
        open={raceModalOpen}
        title={ch.raceTalent.split(" | ")[0] || "Race"}
        onClose={() => setRaceModalOpen(false)}
      >
        <RaceInfo
          race={raceByName[ch.raceTalent.split(" | ")[0] || ""] ?? null}
        />
      </InfoModal>

      {/* You can move Spells/Talents/Equipment/Description into their own components later too */}
    </main>
  );
}

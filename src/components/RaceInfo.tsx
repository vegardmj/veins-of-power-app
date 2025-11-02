// src/components/RaceInfo.tsx
import React from "react";
import type { RaceRecord } from "../types";
import { RACE_INFO_FIELDS } from "../constants";
import { lines } from "../utils/text";
import { talents } from "../models/catalog";

type Props = {
  race: RaceRecord | null;
  talentName?: string;
};

const TALENT_INFO_FIELDS = ["Description", "Action", "Mana"] as const;

function normalizeTable(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}
function isRaceTalentTable(t: Record<string, any>) {
  return normalizeTable(t.Table ?? t.table) === "racetalent";
}

function findTalentByName(name: string) {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  // Prefer only "Race Talent" rows
  const pool = talents.filter(isRaceTalentTable);
  const exact =
    pool.find(
      (t) =>
        String(t.Name ?? t.name ?? "")
          .trim()
          .toLowerCase() === needle
    ) ?? null;
  return exact;
}

export function RaceInfo({ race, talentName }: Props) {
  const talent = React.useMemo(
    () => findTalentByName(talentName || ""),
    [talentName]
  );

  if (!race) return <div style={{ color: "#777" }}>No race selected.</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* --- Race block --- */}
      <div style={{ display: "grid", gap: 8 }}>
        {race["Name"] && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
              Name
            </div>
            <div>{race["Name"]}</div>
          </div>
        )}

        {RACE_INFO_FIELDS.map((field) => {
          const val = race[field];
          if (!val) return null;
          return (
            <div key={field}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
                {field}
              </div>
              <div>{lines(val)}</div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(0,0,0,0.08)",
          margin: "4px 0",
        }}
      />

      {/* --- Selected Race Talent block --- */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h4 style={{ margin: 0 }}>Race Talent</h4>
          <span style={{ fontSize: 12, color: "#777" }}>
            {talentName || "None selected"}
          </span>
        </div>

        {!talent ? (
          <div style={{ color: "#777", marginTop: 6 }}>
            {talentName
              ? "No details found for this talent (or it’s not in the Race Talent table)."
              : "Choose a race talent to view its details."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {/* Always show talent name explicitly */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
                Name
              </div>
              <div>{talent.Name ?? talent.name}</div>
            </div>

            {TALENT_INFO_FIELDS.map((field) => {
              const val = (talent as Record<string, any>)[field];
              if (val == null || String(val).trim() === "") return null;

              return (
                <div key={field}>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
                    {field}
                  </div>
                  <div>{lines(String(val))}</div>{" "}
                  {/* ← actually render the value */}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

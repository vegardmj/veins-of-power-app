import React from "react";
import type { RaceRecord } from "../types";
import { RACE_INFO_FIELDS } from "../constants";
import { lines } from "../utils/text";

export function RaceInfo({ race }: { race: RaceRecord | null }) {
  if (!race) return <div style={{ color: "#777" }}>No race selected.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {/* Always show name at top if present */}
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
  );
}

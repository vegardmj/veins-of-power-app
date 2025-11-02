// existing imports
import racesJson from "../data/races.json";
import talentsJson from "../data/talents.json";
import spellsJson from "../data/spells.json";

export type AnyRec = Record<string, any>;
export type RaceRec = AnyRec;
export type TalentRec = AnyRec;
export type SpellRec = AnyRec;

export const races = racesJson as RaceRec[];
export const talents = talentsJson as TalentRec[];
export const spells = spellsJson as SpellRec[];

// Normalizers
export const getRaceName = (r: RaceRec) => String(r.Name ?? r.name ?? "");
export const getTalentId = (t: TalentRec) =>
  t.ID ?? t.Id ?? t.id ?? t.Id__c ?? "";
export const getTalentName = (t: TalentRec) =>
  t.Name ?? t.name ?? t.Label ?? t.Title ?? "";
const getRequirement = (t: TalentRec) =>
  String(t.Requirement ?? t.Requirements ?? "").trim();

export const raceByName = new Map(races.map((r) => [getRaceName(r), r]));
export const talentById = new Map<string, TalentRec>(
  talents.map((t) => [String(getTalentId(t)), t])
);
export const talentNameById = new Map<string, string>(
  talents.map((t) => [String(getTalentId(t)), String(getTalentName(t))])
);
// --- helpers (add these) ---
const getTable = (t: TalentRec) => String(t.Table ?? t.table ?? "").trim();

// normalize table to compare case/spacing-insensitively
function isRaceTalentTable(t: TalentRec): boolean {
  const norm = getTable(t).toLowerCase().replace(/\s+/g, "");
  // matches "Race Talent", "race talent", "RaceTalent", etc.
  return norm === "racetalent";
}

function parseRequirementRaces(req: string): string[] {
  if (!req) return [];
  return req
    .split(",")
    .map((s) =>
      s
        .replace(/^Race\s*:\s*/i, "")
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

export function isTalentAllowedForRace(
  t: TalentRec,
  raceName: string
): boolean {
  const req = getRequirement(t);
  const wanted = raceName.trim().toLowerCase();
  const list = parseRequirementRaces(req);
  // No requirement => allowed for all
  if (list.length === 0) return true;
  return list.includes(wanted);
}

// ✅ Use both: must be Race Talent table AND allowed by Requirement
export function getAllowedTalentNamesForRace(raceName: string): string[] {
  if (!raceName) return [];
  return talents
    .filter((t) => isRaceTalentTable(t)) // <-- NEW filter
    .filter((t) => isTalentAllowedForRace(t, raceName))
    .map(getTalentName)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export const raceNamesFromJson = races.map(getRaceName).filter(Boolean);

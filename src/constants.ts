import type { AbilityKey, SkillKey } from "./types";

export const RACE_INFO_FIELDS: string[] = [
  "Description",
  "Ability Score",
  "Size",
  "Speed",
  "Hit Point Die",
  "Mana",
  "Demographics",
];

export const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Half-Giant",
  "Gnome",
] as const;
export const TALENTS = [
  "Alert",
  "Ambush",
  "Dual Wield Mastery",
  "Heavy Armor Mastery",
  "Light Armor Mastery",
] as const;
export const DOMAINS = [
  "Darkness",
  "Light",
  "Chaos",
  "Order",
  "Nature",
  "Beauty",
  "Knowledge",
] as const;

export const SKILLS: Array<{
  key: SkillKey;
  label: string;
  ability: AbilityKey;
}> = [
  { key: "Arcana", label: "Arcana (Int)", ability: "Int" },
  { key: "Athletics", label: "Athletics (Phy)", ability: "Phy" },
  { key: "Deception", label: "Deception (Cha)", ability: "Cha" },
  { key: "Finesse", label: "Finesse (Agi)", ability: "Agi" },
  { key: "Insight", label: "Insight (Con)", ability: "Con" },
  { key: "Intimidation", label: "Intimidation (Cha)", ability: "Cha" },
  { key: "Lore", label: "Lore (Int)", ability: "Int" },
  { key: "Might", label: "Might (Phy)", ability: "Phy" },
  { key: "Perception", label: "Perception (Con)", ability: "Con" },
  { key: "Performance", label: "Performance (Cha)", ability: "Cha" },
  { key: "Persuasion", label: "Persuasion (Cha)", ability: "Cha" },
  { key: "Religion", label: "Religion (Int)", ability: "Int" },
  { key: "Stealth", label: "Stealth (Agi)", ability: "Agi" },
  { key: "Survival", label: "Survival (Con)", ability: "Con" },
];

export const abilityKeys: AbilityKey[] = ["Phy", "Agi", "Int", "Con", "Cha"];

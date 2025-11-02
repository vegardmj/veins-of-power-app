import type { Character, Abilities } from "./types";
import { SKILLS } from "./constants";

const STORAGE_KEY = "vop.character.v1";

export const emptyAbilities = (): Abilities => ({
  Phy: { base: "", mod: "", save: "" },
  Agi: { base: "", mod: "", save: "" },
  Int: { base: "", mod: "", save: "" },
  Con: { base: "", mod: "", save: "" },
  Cha: { base: "", mod: "", save: "" },
});

export const emptyCharacter = (): Character => ({
  name: "",
  raceTalent: "",
  level: 1,
  age: "",
  speed: "",
  gender: "",
  initiative: "",
  occupation: "",
  armorClass: "",
  patron: "",
  maxHP: "",
  curHP: "",
  maxMana: "",
  curMana: "",
  abilities: emptyAbilities(),
  skills: SKILLS.map((s) => ({
    key: s.key,
    ability: s.ability,
    bonus: "",
    total: "",
  })),
  actions: Array.from({ length: 7 }, () => ({
    ability: "",
    toHit: "",
    damage: "",
    effect: "",
  })),
  supportActions: Array.from({ length: 6 }, () => ({
    ability: "",
    toHit: "",
    damage: "",
    effect: "",
  })),
  reactions: Array.from({ length: 6 }, () => ({ ability: "", effect: "" })),
  spellMeta: {
    ability: "Int",
    domain: "",
    mod: "",
    spellAttack: "",
    spellSave: "",
  },
  spells: Array.from({ length: 12 }, () => ({
    name: "",
    mana: "",
    description: "",
  })),
  talents: Array.from({ length: 10 }, () => ({ name: "", description: "" })),
  equipment: Array.from({ length: 10 }, () => ({ name: "", description: "" })),
  desc: {
    area: "",
    friendHome: "",
    seeking: "",
    friendNearby: "",
    nemesis: "",
    profession: "",
    physical: "",
    personality: "",
  },
});

export function loadCharacter(): Character | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Character) : null;
  } catch {
    return null;
  }
}
export function saveCharacter(ch: Character) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ch));
}

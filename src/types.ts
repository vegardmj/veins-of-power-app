export type AbilityKey = "Phy" | "Agi" | "Int" | "Con" | "Cha";

export type AbilityRow = {
  base: number | "";
  mod: number | "";
  save: number | "";
};
export type Abilities = Record<AbilityKey, AbilityRow>;

export type SkillKey =
  | "Arcana"
  | "Athletics"
  | "Deception"
  | "Finesse"
  | "Insight"
  | "Intimidation"
  | "Lore"
  | "Might"
  | "Perception"
  | "Performance"
  | "Persuasion"
  | "Religion"
  | "Stealth"
  | "Survival";

export type Skill = {
  key: SkillKey;
  ability: AbilityKey;
  bonus: number | "";
  total: number | "";
};

export type ActionRow = {
  ability: string;
  toHit: string;
  damage: string;
  effect: string;
};
export type SpellRow = { name: string; mana: string; description: string };
export type TalentRow = { name: string; description: string };
export type EquipRow = { name: string; description: string };

export type Character = {
  name: string;
  raceTalent: string;
  level: number | "";
  age: number | "";
  speed: number | "";
  gender: string;
  initiative: number | "";
  occupation: string;
  armorClass: number | "";
  patron: string;
  maxHP: number | "";
  curHP: number | "";
  maxMana: number | "";
  curMana: number | "";
  abilities: Abilities;
  skills: Skill[];
  actions: ActionRow[];
  supportActions: ActionRow[];
  reactions: { ability: string; effect: string }[];
  spellMeta: {
    ability: AbilityKey;
    domain: string;
    mod: number | "";
    spellAttack: number | "";
    spellSave: number | "";
  };
  spells: SpellRow[];
  talents: TalentRow[];
  equipment: EquipRow[];
  desc: {
    area: string;
    friendHome: string;
    seeking: string;
    friendNearby: string;
    nemesis: string;
    profession: string;
    physical: string;
    personality: string;
  };
};

export type RaceRecord = Record<string, string>; // generic “bag of fields”

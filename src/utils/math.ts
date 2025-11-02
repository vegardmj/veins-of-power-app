export function calcMod(base: number | ""): number | "" {
  if (base === "" || Number.isNaN(base)) return "";
  return Math.floor((Number(base) - 10) / 2);
}

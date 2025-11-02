export const BASE = import.meta.env.BASE_URL || "/";

export async function loadJson<T>(file: string): Promise<T> {
  const res = await fetch(`${BASE}data/${file}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.json() as Promise<T>;
}

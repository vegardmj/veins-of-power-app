export type Item = { id: string; title: string; details?: string };

const BASE = import.meta.env.BASE_URL || "/";

/**
 * For GitHub Pages the app is served under /<repo-name>/,
 * so we always prefix with BASE_URL.
 */
export async function getItems(): Promise<Item[]> {
  const res = await fetch(`${BASE}data/items.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load items");
  return res.json() as Promise<Item[]>;
}

const STORAGE_KEY = "beavergreen:favorites";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function getFavoriteIds(): string[] {
  return readIds();
}

export function isFavorite(id: string): boolean {
  return readIds().includes(id);
}

export function addFavorite(id: string): void {
  const ids = readIds();
  if (!ids.includes(id)) {
    writeIds([...ids, id]);
  }
}

export function removeFavorite(id: string): void {
  writeIds(readIds().filter((existing) => existing !== id));
}

export function toggleFavorite(id: string): string[] {
  const ids = readIds();
  const next = ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
  writeIds(next);
  return next;
}

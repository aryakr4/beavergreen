# beavergreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build beavergreen, a Next.js visual nature-exploration map for Oregon and Washington, from the scaffolded repo through a working local build: map + filters, location detail pages, favorites/passport, distance calculations, and a public reviews backend.

**Architecture:** Next.js App Router (TypeScript) reading location content from a local static JSON file (hand-authored, no AI content); a small set of pure `src/lib` utilities (Haversine distance, filtering) shared by client components; `localStorage`-backed favorites with no accounts; a Leaflet/OpenStreetMap map; and a thin Postgres-backed API (`/api/reviews`) for the one feature that needs public write persistence.

**Tech Stack:** Next.js 15 (App Router, TypeScript, `src/` dir), Tailwind CSS, `react-leaflet` + `leaflet` + OpenStreetMap tiles, `pg` for Postgres, Vitest + React Testing Library + jsdom for tests.

**Spec:** `docs/superpowers/specs/2026-08-19-beavergreen-design.md`

## Global Constraints

- No AI APIs and no AI-generated content anywhere in the app — all location copy is hand-authored, stored in static JSON.
- No user accounts or login system anywhere in the app.
- No "visited" tracking — the passport page is the favorites list, not a checklist.
- Map must use `react-leaflet` + OpenStreetMap tiles — no API key, no billing.
- Favorites/passport are `localStorage`-only, no backend.
- Reviews are the only feature backed by a database (Postgres); everything else reads static JSON.
- Reviews are public, anonymous, auto-approved (no moderation queue) for v1, protected only by a honeypot field and IP-based rate limiting.
- Distance calculations use the Haversine formula, computed client-side.

---

## Task 1: Test tooling + base layout

**Files:**
- Modify: `package.json` (add `leaflet`, `react-leaflet`, `pg`, and dev deps `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (remove default create-next-app boilerplate styling that conflicts with a simple custom layout, keep Tailwind directives)
- Test: `src/lib/__tests__/sanity.test.ts`

**Interfaces:**
- Produces: a working `npm test` command (Vitest, jsdom environment, `@/*` path alias resolved) that every later task's tests rely on.

- [ ] **Step 1: Install dependencies**

```bash
cd "/Users/aryakrishnagiri/Downloads/in red/beavergreen"
npm install leaflet react-leaflet pg
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/leaflet @types/pg
```

- [ ] **Step 2: Add the `test` script**

Edit `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Write a sanity test**

Create `src/lib/__tests__/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test tooling", () => {
  it("runs and resolves the @ alias", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run the test suite**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Simplify the base layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "beavergreen",
  description: "A visual nature-exploration map for Oregon and Washington.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold text-green-800">
              beavergreen
            </a>
            <nav className="flex gap-4 text-sm text-stone-600">
              <a href="/" className="hover:text-green-800">
                Explore
              </a>
              <a href="/passport" className="hover:text-green-800">
                Passport
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Replace `src/app/globals.css` content after the Tailwind import with a minimal reset**

```css
@import "tailwindcss";

:root {
  color-scheme: light;
}
```

(Remove any create-next-app dark-mode/font boilerplate below the import.)

- [ ] **Step 9: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: add Vitest tooling and simplify base layout"
```

---

## Task 2: Core types, seed location data, and placeholder image

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/data/locations.json`
- Create: `src/data/locations.ts`
- Create: `public/images/placeholder.svg`
- Test: `src/data/__tests__/locations.test.ts`

**Interfaces:**
- Produces: `Location`, `Category`, `Difficulty`, `USState`, `Coordinates` types (used by every later task); `getAllLocations(): Location[]` and `getLocationById(id: string): Location | undefined` from `src/data/locations.ts`.

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
export type USState = "OR" | "WA";

export type Category =
  | "waterfall"
  | "hike"
  | "viewpoint"
  | "lake"
  | "hot-spring"
  | "beach"
  | "forest"
  | "other";

export type Difficulty = "easy" | "moderate" | "hard";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PracticalInfo {
  parking?: string;
  fee?: string;
  dogFriendly?: boolean;
}

export interface Location {
  id: string;
  name: string;
  state: USState;
  category: Category;
  difficulty: Difficulty;
  lat: number;
  lng: number;
  description: string;
  bestSeason?: string[];
  practicalInfo?: PracticalInfo;
  photos: string[];
  createdAt: string;
}

export interface Review {
  id: number;
  locationId: string;
  rating: number;
  text: string;
  authorName?: string;
  createdAt: string;
}
```

- [ ] **Step 2: Create a placeholder image**

Create `public/images/placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#d9e8d6"/>
  <text x="400" y="300" font-family="sans-serif" font-size="28" fill="#4b6a4d" text-anchor="middle" dominant-baseline="middle">
    Photo coming soon
  </text>
</svg>
```

- [ ] **Step 3: Create seed location data**

Create `src/data/locations.json` (five real OR/WA spots as seed content, photos pointing at the placeholder until real photos are added):

```json
[
  {
    "id": "multnomah-falls",
    "name": "Multnomah Falls",
    "state": "OR",
    "category": "waterfall",
    "difficulty": "easy",
    "lat": 45.5762,
    "lng": -122.1158,
    "description": "One of the tallest year-round waterfalls in the US, right off the Columbia River Gorge. A short, steep paved path leads to the Benson Bridge viewpoint.",
    "bestSeason": ["spring", "fall", "winter"],
    "practicalInfo": { "parking": "Large lot off I-84, fills early on weekends", "fee": "Free", "dogFriendly": true },
    "photos": ["/images/placeholder.svg"],
    "createdAt": "2026-08-19"
  },
  {
    "id": "smith-rock",
    "name": "Smith Rock State Park",
    "state": "OR",
    "category": "hike",
    "difficulty": "hard",
    "lat": 44.3675,
    "lng": -121.1401,
    "description": "Dramatic red-rock canyon carved by the Crooked River. The Misery Ridge loop is steep but the views over the river bend are unmatched.",
    "bestSeason": ["spring", "fall"],
    "practicalInfo": { "parking": "Day-use fee lot", "fee": "$5 day-use", "dogFriendly": true },
    "photos": ["/images/placeholder.svg"],
    "createdAt": "2026-08-19"
  },
  {
    "id": "diablo-lake",
    "name": "Diablo Lake Overlook",
    "state": "WA",
    "category": "viewpoint",
    "difficulty": "easy",
    "lat": 48.7128,
    "lng": -121.0959,
    "description": "A pullout on the North Cascades Highway overlooking a strikingly turquoise glacial lake, framed by jagged peaks.",
    "bestSeason": ["summer", "fall"],
    "practicalInfo": { "parking": "Roadside pullout", "fee": "Free", "dogFriendly": true },
    "photos": ["/images/placeholder.svg"],
    "createdAt": "2026-08-19"
  },
  {
    "id": "ruby-beach",
    "name": "Ruby Beach",
    "state": "WA",
    "category": "beach",
    "difficulty": "easy",
    "lat": 47.7128,
    "lng": -124.4165,
    "description": "Olympic coast beach known for sea stacks and driftwood piles, especially dramatic at sunset.",
    "bestSeason": ["summer"],
    "practicalInfo": { "parking": "Small lot off Highway 101", "fee": "Olympic National Park pass", "dogFriendly": false },
    "photos": ["/images/placeholder.svg"],
    "createdAt": "2026-08-19"
  },
  {
    "id": "bagby-hot-springs",
    "name": "Bagby Hot Springs",
    "state": "OR",
    "category": "hot-spring",
    "difficulty": "moderate",
    "lat": 44.9995,
    "lng": -122.2314,
    "description": "Rustic hot spring in the Mt. Hood National Forest, reached by a 1.5-mile forest trail to hand-hewn cedar soaking tubs.",
    "bestSeason": ["fall", "winter", "spring"],
    "practicalInfo": { "parking": "Trailhead lot", "fee": "$5 day-use", "dogFriendly": false },
    "photos": ["/images/placeholder.svg"],
    "createdAt": "2026-08-19"
  }
]
```

- [ ] **Step 4: Write the failing test for the data loader**

Create `src/data/__tests__/locations.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getAllLocations, getLocationById } from "@/data/locations";

describe("locations data loader", () => {
  it("returns all seed locations with required fields", () => {
    const locations = getAllLocations();
    expect(locations.length).toBeGreaterThanOrEqual(5);
    for (const loc of locations) {
      expect(loc.id).toBeTruthy();
      expect(loc.name).toBeTruthy();
      expect(["OR", "WA"]).toContain(loc.state);
      expect(typeof loc.lat).toBe("number");
      expect(typeof loc.lng).toBe("number");
      expect(loc.photos.length).toBeGreaterThan(0);
    }
  });

  it("finds a location by id", () => {
    const loc = getLocationById("multnomah-falls");
    expect(loc?.name).toBe("Multnomah Falls");
  });

  it("returns undefined for an unknown id", () => {
    expect(getLocationById("nonexistent")).toBeUndefined();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- locations.test.ts`
Expected: FAIL — `@/data/locations` has no exported member.

- [ ] **Step 6: Implement the loader**

Create `src/data/locations.ts`:

```ts
import rawLocations from "./locations.json";
import type { Location } from "@/lib/types";

const locations = rawLocations as Location[];

export function getAllLocations(): Location[] {
  return locations;
}

export function getLocationById(id: string): Location | undefined {
  return locations.find((loc) => loc.id === id);
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- locations.test.ts`
Expected: 3 passed.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add location types, seed data, and data loader"
```

---

## Task 3: Major cities list and Haversine distance utilities

**Files:**
- Create: `src/data/majorCities.ts`
- Create: `src/lib/distance.ts`
- Test: `src/lib/__tests__/distance.test.ts`

**Interfaces:**
- Consumes: `Coordinates`, `Location` from `src/lib/types.ts` (Task 2).
- Produces: `MajorCity` type and `MAJOR_CITIES` array from `src/data/majorCities.ts`; `haversineDistanceMiles(a: Coordinates, b: Coordinates): number`, `distanceToMajorCities(point: Coordinates): { city: MajorCity; miles: number }[]`, and `nearbyLocations(target: Location, all: Location[], maxMiles: number): { location: Location; miles: number }[]` from `src/lib/distance.ts`.

- [ ] **Step 1: Create the major cities list**

Create `src/data/majorCities.ts`:

```ts
import type { USState } from "@/lib/types";

export interface MajorCity {
  name: string;
  state: USState;
  lat: number;
  lng: number;
}

export const MAJOR_CITIES: MajorCity[] = [
  { name: "Portland", state: "OR", lat: 45.5152, lng: -122.6784 },
  { name: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321 },
  { name: "Eugene", state: "OR", lat: 44.0521, lng: -123.0868 },
  { name: "Bend", state: "OR", lat: 44.0582, lng: -121.3153 },
  { name: "Spokane", state: "WA", lat: 47.6588, lng: -117.4260 },
  { name: "Vancouver", state: "WA", lat: 45.6387, lng: -122.6615 },
  { name: "Tacoma", state: "WA", lat: 47.2529, lng: -122.4443 },
  { name: "Salem", state: "OR", lat: 44.9429, lng: -123.0351 },
];
```

- [ ] **Step 2: Write the failing tests for distance utilities**

Create `src/lib/__tests__/distance.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { haversineDistanceMiles, distanceToMajorCities, nearbyLocations } from "@/lib/distance";
import type { Location } from "@/lib/types";

const portland = { lat: 45.5152, lng: -122.6784 };
const seattle = { lat: 47.6062, lng: -122.3321 };

const makeLocation = (overrides: Partial<Location>): Location => ({
  id: "test-loc",
  name: "Test Location",
  state: "OR",
  category: "hike",
  difficulty: "easy",
  lat: 45.5,
  lng: -122.5,
  description: "test",
  photos: ["/images/placeholder.svg"],
  createdAt: "2026-08-19",
  ...overrides,
});

describe("haversineDistanceMiles", () => {
  it("returns 0 for identical points", () => {
    expect(haversineDistanceMiles(portland, portland)).toBeCloseTo(0, 5);
  });

  it("returns the known approximate distance between Portland and Seattle", () => {
    const miles = haversineDistanceMiles(portland, seattle);
    expect(miles).toBeGreaterThan(140);
    expect(miles).toBeLessThan(150);
  });
});

describe("distanceToMajorCities", () => {
  it("returns one entry per major city, sorted nearest-first", () => {
    const results = distanceToMajorCities(portland);
    expect(results.length).toBe(8);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].miles).toBeGreaterThanOrEqual(results[i - 1].miles);
    }
    expect(results[0].city.name).toBe("Portland");
    expect(results[0].miles).toBeCloseTo(0, 5);
  });
});

describe("nearbyLocations", () => {
  it("excludes the target location itself and locations beyond maxMiles", () => {
    const target = makeLocation({ id: "a", lat: 45.5, lng: -122.5 });
    const near = makeLocation({ id: "b", lat: 45.51, lng: -122.51 });
    const far = makeLocation({ id: "c", lat: 47.6, lng: -122.33 });
    const results = nearbyLocations(target, [target, near, far], 10);
    expect(results.map((r) => r.location.id)).toEqual(["b"]);
  });

  it("sorts results nearest-first", () => {
    const target = makeLocation({ id: "a", lat: 45.5, lng: -122.5 });
    const mid = makeLocation({ id: "b", lat: 45.6, lng: -122.5 });
    const near = makeLocation({ id: "c", lat: 45.51, lng: -122.5 });
    const results = nearbyLocations(target, [target, mid, near], 100);
    expect(results.map((r) => r.location.id)).toEqual(["c", "b"]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- distance.test.ts`
Expected: FAIL — `@/lib/distance` module not found.

- [ ] **Step 4: Implement distance utilities**

Create `src/lib/distance.ts`:

```ts
import { MAJOR_CITIES, type MajorCity } from "@/data/majorCities";
import type { Coordinates, Location } from "@/lib/types";

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMiles(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_MILES * c;
}

export function distanceToMajorCities(
  point: Coordinates
): { city: MajorCity; miles: number }[] {
  return MAJOR_CITIES.map((city) => ({
    city,
    miles: haversineDistanceMiles(point, city),
  })).sort((a, b) => a.miles - b.miles);
}

export function nearbyLocations(
  target: Location,
  all: Location[],
  maxMiles: number
): { location: Location; miles: number }[] {
  return all
    .filter((loc) => loc.id !== target.id)
    .map((location) => ({
      location,
      miles: haversineDistanceMiles(target, location),
    }))
    .filter((entry) => entry.miles <= maxMiles)
    .sort((a, b) => a.miles - b.miles);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- distance.test.ts`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add major cities list and Haversine distance utilities"
```

---

## Task 4: Location filtering logic

**Files:**
- Create: `src/lib/filters.ts`
- Test: `src/lib/__tests__/filters.test.ts`

**Interfaces:**
- Consumes: `Location`, `Category`, `Difficulty`, `USState`, `Coordinates` (Task 2), `haversineDistanceMiles` (Task 3).
- Produces: `LocationFilters` type and `filterLocations(locations: Location[], filters: LocationFilters): Location[]` from `src/lib/filters.ts`, used by `FilterBar`/home page in Task 8/10.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/filters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filterLocations } from "@/lib/filters";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  {
    id: "a", name: "A", state: "OR", category: "hike", difficulty: "easy",
    lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
  {
    id: "b", name: "B", state: "WA", category: "waterfall", difficulty: "hard",
    lat: 47.6, lng: -122.3, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
  {
    id: "c", name: "C", state: "OR", category: "waterfall", difficulty: "moderate",
    lat: 45.51, lng: -122.51, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
];

describe("filterLocations", () => {
  it("returns all locations when no filters are set", () => {
    expect(filterLocations(locations, {})).toHaveLength(3);
  });

  it("filters by category", () => {
    const result = filterLocations(locations, { category: "waterfall" });
    expect(result.map((l) => l.id)).toEqual(["b", "c"]);
  });

  it("filters by state", () => {
    const result = filterLocations(locations, { state: "OR" });
    expect(result.map((l) => l.id)).toEqual(["a", "c"]);
  });

  it("filters by difficulty", () => {
    const result = filterLocations(locations, { difficulty: "hard" });
    expect(result.map((l) => l.id)).toEqual(["b"]);
  });

  it("filters by max distance from an origin", () => {
    const result = filterLocations(locations, {
      origin: { lat: 45.5, lng: -122.5 },
      maxDistanceMiles: 10,
    });
    expect(result.map((l) => l.id).sort()).toEqual(["a", "c"]);
  });

  it("combines multiple filters", () => {
    const result = filterLocations(locations, { state: "OR", category: "waterfall" });
    expect(result.map((l) => l.id)).toEqual(["c"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- filters.test.ts`
Expected: FAIL — `@/lib/filters` module not found.

- [ ] **Step 3: Implement `filterLocations`**

Create `src/lib/filters.ts`:

```ts
import { haversineDistanceMiles } from "@/lib/distance";
import type { Category, Coordinates, Difficulty, Location, USState } from "@/lib/types";

export interface LocationFilters {
  category?: Category;
  state?: USState;
  difficulty?: Difficulty;
  maxDistanceMiles?: number;
  origin?: Coordinates;
}

export function filterLocations(
  locations: Location[],
  filters: LocationFilters
): Location[] {
  return locations.filter((loc) => {
    if (filters.category && loc.category !== filters.category) return false;
    if (filters.state && loc.state !== filters.state) return false;
    if (filters.difficulty && loc.difficulty !== filters.difficulty) return false;
    if (filters.maxDistanceMiles != null && filters.origin) {
      const miles = haversineDistanceMiles(filters.origin, loc);
      if (miles > filters.maxDistanceMiles) return false;
    }
    return true;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- filters.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add location filtering logic"
```

---

## Task 5: Favorites (localStorage) helpers and hook

**Files:**
- Create: `src/lib/favorites.ts`
- Create: `src/hooks/useFavorites.ts`
- Test: `src/lib/__tests__/favorites.test.ts`
- Test: `src/hooks/__tests__/useFavorites.test.tsx`

**Interfaces:**
- Produces: `getFavoriteIds(): string[]`, `isFavorite(id: string): boolean`, `addFavorite(id: string): void`, `removeFavorite(id: string): void`, `toggleFavorite(id: string): string[]` from `src/lib/favorites.ts`; `useFavorites(): { favoriteIds: string[]; isFavorite: (id: string) => boolean; toggleFavorite: (id: string) => void }` from `src/hooks/useFavorites.ts`. Used by `FavoriteButton` (Task 12) and the passport page (Task 14).

- [ ] **Step 1: Write the failing tests for the storage helpers**

Create `src/lib/__tests__/favorites.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { getFavoriteIds, isFavorite, addFavorite, removeFavorite, toggleFavorite } from "@/lib/favorites";

beforeEach(() => {
  localStorage.clear();
});

describe("favorites storage", () => {
  it("starts empty", () => {
    expect(getFavoriteIds()).toEqual([]);
  });

  it("adds a favorite", () => {
    addFavorite("multnomah-falls");
    expect(getFavoriteIds()).toEqual(["multnomah-falls"]);
    expect(isFavorite("multnomah-falls")).toBe(true);
  });

  it("does not duplicate an existing favorite", () => {
    addFavorite("multnomah-falls");
    addFavorite("multnomah-falls");
    expect(getFavoriteIds()).toEqual(["multnomah-falls"]);
  });

  it("removes a favorite", () => {
    addFavorite("multnomah-falls");
    removeFavorite("multnomah-falls");
    expect(getFavoriteIds()).toEqual([]);
    expect(isFavorite("multnomah-falls")).toBe(false);
  });

  it("toggles a favorite on and off, returning the new list", () => {
    expect(toggleFavorite("smith-rock")).toEqual(["smith-rock"]);
    expect(toggleFavorite("smith-rock")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- favorites.test.ts`
Expected: FAIL — `@/lib/favorites` module not found.

- [ ] **Step 3: Implement the storage helpers**

Create `src/lib/favorites.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- favorites.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Write the failing test for the hook**

Create `src/hooks/__tests__/useFavorites.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/useFavorites";

beforeEach(() => {
  localStorage.clear();
});

describe("useFavorites", () => {
  it("reflects toggled favorites in state", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favoriteIds).toEqual([]);

    act(() => result.current.toggleFavorite("ruby-beach"));
    expect(result.current.favoriteIds).toEqual(["ruby-beach"]);
    expect(result.current.isFavorite("ruby-beach")).toBe(true);

    act(() => result.current.toggleFavorite("ruby-beach"));
    expect(result.current.favoriteIds).toEqual([]);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- useFavorites.test.tsx`
Expected: FAIL — `@/hooks/useFavorites` module not found.

- [ ] **Step 7: Implement the hook**

Create `src/hooks/useFavorites.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getFavoriteIds, toggleFavorite as toggleFavoriteStorage } from "@/lib/favorites";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(toggleFavoriteStorage(id));
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite };
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- useFavorites.test.tsx`
Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add localStorage favorites helpers and useFavorites hook"
```

---

## Task 6: Geolocation hook

**Files:**
- Create: `src/hooks/useGeolocation.ts`
- Test: `src/hooks/__tests__/useGeolocation.test.tsx`

**Interfaces:**
- Produces: `GeolocationState` type and `useGeolocation(): GeolocationState` from `src/hooks/useGeolocation.ts`, where `GeolocationState = { coords: Coordinates | null; loading: boolean; error: string | null }`. Used by `DistanceInfo` (Task 11) and the home page (Task 10).

- [ ] **Step 1: Write the failing test**

Create `src/hooks/__tests__/useGeolocation.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGeolocation } from "@/hooks/useGeolocation";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGeolocation", () => {
  it("resolves coordinates on success", async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: { latitude: 45.5, longitude: -122.5 },
      } as GeolocationPosition);
    });
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.coords).toEqual({ lat: 45.5, lng: -122.5 });
    expect(result.current.error).toBeNull();
  });

  it("sets an error message when permission is denied", async () => {
    const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: "denied" } as GeolocationPositionError);
    });
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it("sets an error message when geolocation is unavailable", async () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBe("Geolocation is not available in this browser.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useGeolocation.test.tsx`
Expected: FAIL — `@/hooks/useGeolocation` module not found.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useGeolocation.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/lib/types";

export interface GeolocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ coords: null, loading: false, error: "Geolocation is not available in this browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
          loading: false,
          error: null,
        });
      },
      () => {
        setState({
          coords: null,
          loading: false,
          error: "Enable location access to see distance from you.",
        });
      }
    );
  }, []);

  return state;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useGeolocation.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add browser geolocation hook"
```

---

## Task 7: Leaflet map component

**Files:**
- Create: `src/components/Map.tsx`
- Modify: `src/app/globals.css` (import Leaflet CSS)
- Test: `src/components/__tests__/Map.test.tsx`

**Interfaces:**
- Consumes: `Location`, `Coordinates` (Task 2).
- Produces: default export `LocationMap` from `src/components/Map.tsx` with props `{ locations: Location[]; selectedId?: string | null; onSelect?: (id: string) => void; origin?: Coordinates | null }`. Used by the home page (Task 10).

- [ ] **Step 1: Import Leaflet's CSS globally**

Add to the top of `src/app/globals.css`, before the Tailwind import:

```css
@import "leaflet/dist/leaflet.css";
@import "tailwindcss";
```

- [ ] **Step 2: Write a smoke test**

Full interactive Leaflet behavior is not reliable to assert against in jsdom, so this test only verifies the component renders a marker per location and calls `onSelect` when a marker is clicked — sourced from `react-leaflet`'s public DOM output. Create `src/components/__tests__/Map.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LocationMap from "@/components/Map";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  {
    id: "a", name: "Spot A", state: "OR", category: "hike", difficulty: "easy",
    lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
  {
    id: "b", name: "Spot B", state: "WA", category: "lake", difficulty: "moderate",
    lat: 47.6, lng: -122.3, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
];

describe("LocationMap", () => {
  it("renders a marker for each location", () => {
    render(<LocationMap locations={locations} />);
    expect(screen.getAllByRole("button", { name: /spot (a|b)/i }).length).toBe(2);
  });

  it("calls onSelect when a marker is activated", () => {
    const onSelect = vi.fn();
    render(<LocationMap locations={locations} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /spot a/i }));
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- Map.test.tsx`
Expected: FAIL — `@/components/Map` module not found.

- [ ] **Step 4: Implement the map component**

Create `src/components/Map.tsx`:

```tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { Coordinates, Location } from "@/lib/types";

// Default Leaflet marker icons reference bundler-relative asset URLs that
// don't resolve under Next.js's bundler, so they're set explicitly here.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapProps {
  locations: Location[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  origin?: Coordinates | null;
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [locations, map]);
  return null;
}

export default function LocationMap({ locations, selectedId, onSelect, origin }: MapProps) {
  const center: [number, number] = origin
    ? [origin.lat, origin.lng]
    : [45.9, -121.5];

  return (
    <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={markerIcon}
          eventHandlers={{ click: () => onSelect?.(loc.id) }}
          opacity={selectedId && selectedId !== loc.id ? 0.6 : 1}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- Map.test.tsx`
Expected: 2 passed. (If Leaflet marker buttons aren't exposed with accessible names under jsdom, adjust the queries to `container.querySelectorAll(".leaflet-marker-icon")` and assert `.length`/simulate a `click` DOM event on the element instead — keep the assertions on marker count and `onSelect` invocation.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Leaflet map component with OpenStreetMap tiles"
```

---

## Task 8: FilterBar component

**Files:**
- Create: `src/components/FilterBar.tsx`
- Test: `src/components/__tests__/FilterBar.test.tsx`

**Interfaces:**
- Consumes: `LocationFilters` (Task 4).
- Produces: default export `FilterBar` from `src/components/FilterBar.tsx` with props `{ filters: LocationFilters; onChange: (filters: LocationFilters) => void }`. Used by the home page (Task 10).

- [ ] **Step 1: Write the failing tests**

Create `src/components/__tests__/FilterBar.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterBar from "@/components/FilterBar";
import type { LocationFilters } from "@/lib/filters";

describe("FilterBar", () => {
  it("calls onChange with the selected category", () => {
    const onChange = vi.fn();
    const filters: LocationFilters = {};
    render(<FilterBar filters={filters} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "waterfall" } });
    expect(onChange).toHaveBeenCalledWith({ category: "waterfall" });
  });

  it("calls onChange with the selected state", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: "WA" } });
    expect(onChange).toHaveBeenCalledWith({ state: "WA" });
  });

  it("clears a filter when set back to 'any'", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{ category: "waterfall" }} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("updates the max distance filter", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/max distance/i), { target: { value: "25" } });
    expect(onChange).toHaveBeenCalledWith({ maxDistanceMiles: 25 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- FilterBar.test.tsx`
Expected: FAIL — `@/components/FilterBar` module not found.

- [ ] **Step 3: Implement `FilterBar`**

Create `src/components/FilterBar.tsx`:

```tsx
"use client";

import type { ChangeEvent } from "react";
import type { LocationFilters } from "@/lib/filters";
import type { Category, Difficulty, USState } from "@/lib/types";

export interface FilterBarProps {
  filters: LocationFilters;
  onChange: (filters: LocationFilters) => void;
}

const CATEGORIES: Category[] = ["waterfall", "hike", "viewpoint", "lake", "hot-spring", "beach", "forest", "other"];
const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard"];
const STATES: USState[] = ["OR", "WA"];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (patch: Partial<LocationFilters>) => {
    const next = { ...filters, ...patch };
    (Object.keys(next) as (keyof LocationFilters)[]).forEach((key) => {
      if (next[key] === undefined || next[key] === "") delete next[key];
    });
    onChange(next);
  };

  const handleSelect = (key: "category" | "state" | "difficulty") => (e: ChangeEvent<HTMLSelectElement>) => {
    update({ [key]: e.target.value || undefined } as Partial<LocationFilters>);
  };

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-stone-200 bg-white p-4">
      <label className="flex flex-col text-sm text-stone-700">
        Category
        <select
          aria-label="Category"
          value={filters.category ?? ""}
          onChange={handleSelect("category")}
          className="mt-1 rounded border border-stone-300 px-2 py-1"
        >
          <option value="">Any</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-stone-700">
        State
        <select
          aria-label="State"
          value={filters.state ?? ""}
          onChange={handleSelect("state")}
          className="mt-1 rounded border border-stone-300 px-2 py-1"
        >
          <option value="">Any</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-stone-700">
        Difficulty
        <select
          aria-label="Difficulty"
          value={filters.difficulty ?? ""}
          onChange={handleSelect("difficulty")}
          className="mt-1 rounded border border-stone-300 px-2 py-1"
        >
          <option value="">Any</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-stone-700">
        Max distance (miles)
        <input
          aria-label="Max distance"
          type="number"
          min={0}
          value={filters.maxDistanceMiles ?? ""}
          onChange={(e) =>
            update({ maxDistanceMiles: e.target.value ? Number(e.target.value) : undefined })
          }
          className="mt-1 w-28 rounded border border-stone-300 px-2 py-1"
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- FilterBar.test.tsx`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add FilterBar component"
```

---

## Task 9: LocationCard and LocationList components

**Files:**
- Create: `src/components/LocationCard.tsx`
- Create: `src/components/LocationList.tsx`
- Test: `src/components/__tests__/LocationCard.test.tsx`
- Test: `src/components/__tests__/LocationList.test.tsx`

**Interfaces:**
- Consumes: `Location`, `Coordinates` (Task 2), `haversineDistanceMiles` (Task 3).
- Produces: default export `LocationCard` with props `{ location: Location; distanceMiles?: number }`; default export `LocationList` with props `{ locations: Location[]; origin?: Coordinates | null; selectedId?: string | null; onSelect?: (id: string) => void }`. Used by the home page (Task 10) and passport page (Task 14).

- [ ] **Step 1: Write the failing test for `LocationCard`**

Create `src/components/__tests__/LocationCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LocationCard from "@/components/LocationCard";
import type { Location } from "@/lib/types";

const location: Location = {
  id: "multnomah-falls", name: "Multnomah Falls", state: "OR", category: "waterfall",
  difficulty: "easy", lat: 45.5762, lng: -122.1158, description: "A tall waterfall.",
  photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};

describe("LocationCard", () => {
  it("renders the location name, state, and category", () => {
    render(<LocationCard location={location} />);
    expect(screen.getByText("Multnomah Falls")).toBeInTheDocument();
    expect(screen.getByText(/OR/)).toBeInTheDocument();
    expect(screen.getByText(/waterfall/i)).toBeInTheDocument();
  });

  it("shows the distance when provided", () => {
    render(<LocationCard location={location} distanceMiles={12.345} />);
    expect(screen.getByText(/12(\.3)? mi/i)).toBeInTheDocument();
  });

  it("omits distance text when not provided", () => {
    render(<LocationCard location={location} />);
    expect(screen.queryByText(/mi away/i)).not.toBeInTheDocument();
  });

  it("swaps to the placeholder if the photo fails to load", () => {
    render(<LocationCard location={location} />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- LocationCard.test.tsx`
Expected: FAIL — `@/components/LocationCard` module not found.

- [ ] **Step 3: Implement `LocationCard`**

Add `fireEvent` to the test file's import: `import { render, screen, fireEvent } from "@testing-library/react";`

Create `src/components/LocationCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Location } from "@/lib/types";

export interface LocationCardProps {
  location: Location;
  distanceMiles?: number;
}

const PLACEHOLDER = "/images/placeholder.svg";

export default function LocationCard({ location, distanceMiles }: LocationCardProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={`/locations/${location.id}`}
      className="block overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:shadow-md"
    >
      <div className="relative h-40 w-full bg-stone-100">
        <Image
          src={failed ? PLACEHOLDER : location.photos[0] ?? PLACEHOLDER}
          alt={location.name}
          fill
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-stone-900">{location.name}</h3>
        <p className="mt-1 text-sm text-stone-600">
          {location.state} &middot; {location.category} &middot; {location.difficulty}
        </p>
        {distanceMiles != null && (
          <p className="mt-1 text-sm text-green-700">{distanceMiles.toFixed(1)} mi away</p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- LocationCard.test.tsx`
Expected: 4 passed.

- [ ] **Step 5: Write the failing test for `LocationList`**

Create `src/components/__tests__/LocationList.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LocationList from "@/components/LocationList";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  { id: "a", name: "Spot A", state: "OR", category: "hike", difficulty: "easy", lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19" },
  { id: "b", name: "Spot B", state: "WA", category: "lake", difficulty: "moderate", lat: 47.6, lng: -122.3, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19" },
];

describe("LocationList", () => {
  it("renders a card per location", () => {
    render(<LocationList locations={locations} />);
    expect(screen.getByText("Spot A")).toBeInTheDocument();
    expect(screen.getByText("Spot B")).toBeInTheDocument();
  });

  it("shows an empty state when there are no locations", () => {
    render(<LocationList locations={[]} />);
    expect(screen.getByText(/no spots match/i)).toBeInTheDocument();
  });

  it("shows distance from the origin when provided", () => {
    render(<LocationList locations={locations} origin={{ lat: 45.5, lng: -122.5 }} />);
    expect(screen.getByText(/0\.0 mi away/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- LocationList.test.tsx`
Expected: FAIL — `@/components/LocationList` module not found.

- [ ] **Step 7: Implement `LocationList`**

Create `src/components/LocationList.tsx`:

```tsx
"use client";

import { haversineDistanceMiles } from "@/lib/distance";
import LocationCard from "@/components/LocationCard";
import type { Coordinates, Location } from "@/lib/types";

export interface LocationListProps {
  locations: Location[];
  origin?: Coordinates | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function LocationList({ locations, origin, selectedId, onSelect }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-stone-500">
        No spots match your filters yet — try widening them.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((location) => (
        <div
          key={location.id}
          onMouseEnter={() => onSelect?.(location.id)}
          className={selectedId === location.id ? "ring-2 ring-green-600 rounded-lg" : undefined}
        >
          <LocationCard
            location={location}
            distanceMiles={origin ? haversineDistanceMiles(origin, location) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- LocationList.test.tsx`
Expected: 3 passed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add LocationCard and LocationList components"
```

---

## Task 10: Home page — map, filters, and list wired together

**Files:**
- Modify: `src/app/page.tsx`
- Test: `src/app/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `getAllLocations` (Task 2), `filterLocations`/`LocationFilters` (Task 4), `useGeolocation` (Task 6), `LocationMap` (Task 7), `FilterBar` (Task 8), `LocationList` (Task 9).

- [ ] **Step 1: Write a failing integration test**

The real `Map` component depends on browser-only Leaflet DOM sizing that isn't meaningful in jsdom, so this test mocks it and asserts the page's own logic: filters narrow the list, and the map receives the filtered set. Create `src/app/__tests__/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/Map", () => ({
  default: ({ locations }: { locations: { id: string }[] }) => (
    <div data-testid="map" data-count={locations.length} />
  ),
}));

import Home from "@/app/page";

describe("Home page", () => {
  it("renders every seed location by default", () => {
    render(<Home />);
    expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(5);
  });

  it("narrows the list and the map when a filter is applied", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "waterfall" } });

    const map = screen.getByTestId("map");
    expect(Number(map.dataset.count)).toBeGreaterThan(0);
    expect(Number(map.dataset.count)).toBeLessThan(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- page.test.tsx`
Expected: FAIL — the default `page.tsx` from `create-next-app` doesn't render a `FilterBar`/`Map`/location links.

- [ ] **Step 3: Implement the home page**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import FilterBar from "@/components/FilterBar";
import LocationList from "@/components/LocationList";
import { getAllLocations } from "@/data/locations";
import { filterLocations, type LocationFilters } from "@/lib/filters";
import { useGeolocation } from "@/hooks/useGeolocation";

const LocationMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const allLocations = useMemo(() => getAllLocations(), []);
  const [filters, setFilters] = useState<LocationFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { coords, error: geoError } = useGeolocation();

  const filtered = useMemo(() => {
    const withOrigin: LocationFilters = coords ? { ...filters, origin: coords } : filters;
    return filterLocations(allLocations, withOrigin);
  }, [allLocations, filters, coords]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Where should you go this weekend?</h1>
        <p className="mt-1 text-stone-600">
          Hand-picked spots across Oregon and Washington — pictures, notes, and how far they are from you.
        </p>
        {geoError && <p className="mt-1 text-sm text-stone-400">{geoError}</p>}
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="h-96 overflow-hidden rounded-lg border border-stone-200">
        <LocationMap locations={filtered} selectedId={selectedId} onSelect={setSelectedId} origin={coords} />
      </div>

      <LocationList locations={filtered} origin={coords} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- page.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Manual browser check**

Run: `npm run dev`, open `http://localhost:3000`, confirm the map renders with pins, filters narrow both the map and list, and the layout is usable on a narrow viewport.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire map, filters, and list together on the home page"
```

---

## Task 11: PhotoGallery, DistanceInfo, and NearbySpots components

**Files:**
- Create: `src/components/PhotoGallery.tsx`
- Create: `src/components/DistanceInfo.tsx`
- Create: `src/components/NearbySpots.tsx`
- Test: `src/components/__tests__/PhotoGallery.test.tsx`
- Test: `src/components/__tests__/DistanceInfo.test.tsx`
- Test: `src/components/__tests__/NearbySpots.test.tsx`

**Interfaces:**
- Consumes: `Location` (Task 2), `distanceToMajorCities`/`nearbyLocations` (Task 3), `useGeolocation` (Task 6), `LocationCard` (Task 9).
- Produces: default exports `PhotoGallery` (`{ photos: string[]; alt: string }`), `DistanceInfo` (`{ location: Location }`), `NearbySpots` (`{ location: Location; allLocations: Location[]; maxMiles?: number }`). Used by the location detail page (Task 13).

- [ ] **Step 1: Write the failing test for `PhotoGallery`**

Create `src/components/__tests__/PhotoGallery.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PhotoGallery from "@/components/PhotoGallery";

describe("PhotoGallery", () => {
  it("renders one image per photo", () => {
    render(<PhotoGallery photos={["/images/a.jpg", "/images/b.jpg"]} alt="Test Spot" />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("falls back to the placeholder when given no photos", () => {
    render(<PhotoGallery photos={[]} alt="Test Spot" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });

  it("swaps a photo to the placeholder if it fails to load", () => {
    render(<PhotoGallery photos={["/images/broken.jpg"]} alt="Test Spot" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("broken.jpg"));

    fireEvent.error(img);
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then implement `PhotoGallery`**

Run: `npm test -- PhotoGallery.test.tsx` — expect FAIL (module not found).

Create `src/components/PhotoGallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export interface PhotoGalleryProps {
  photos: string[];
  alt: string;
}

const PLACEHOLDER = "/images/placeholder.svg";

export default function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const displayPhotos = photos.length > 0 ? photos : [PLACEHOLDER];
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {displayPhotos.map((src, i) => (
        <div key={src + i} className="relative h-48 overflow-hidden rounded-lg bg-stone-100">
          <Image
            src={failed[i] ? PLACEHOLDER : src}
            alt={`${alt} photo ${i + 1}`}
            fill
            className="object-cover"
            onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
          />
        </div>
      ))}
    </div>
  );
}
```

Update the test file's imports to include `fireEvent`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
```

Run: `npm test -- PhotoGallery.test.tsx` — Expected: 3 passed.

- [ ] **Step 3: Write the failing test for `DistanceInfo`**

Create `src/components/__tests__/DistanceInfo.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Location } from "@/lib/types";

const location: Location = {
  id: "multnomah-falls", name: "Multnomah Falls", state: "OR", category: "waterfall",
  difficulty: "easy", lat: 45.5762, lng: -122.1158, description: "",
  photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({ coords: { lat: 45.5152, lng: -122.6784 }, loading: false, error: null }),
}));

import DistanceInfo from "@/components/DistanceInfo";

describe("DistanceInfo", () => {
  it("shows distance from the visitor when geolocation succeeds", () => {
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/mi from you/i)).toBeInTheDocument();
  });

  it("lists distances to major cities", () => {
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/Portland/)).toBeInTheDocument();
    expect(screen.getByText(/Seattle/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails, then implement `DistanceInfo`**

Run: `npm test -- DistanceInfo.test.tsx` — expect FAIL (module not found).

Create `src/components/DistanceInfo.tsx`:

```tsx
"use client";

import { distanceToMajorCities, haversineDistanceMiles } from "@/lib/distance";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Location } from "@/lib/types";

export interface DistanceInfoProps {
  location: Location;
}

export default function DistanceInfo({ location }: DistanceInfoProps) {
  const { coords, error } = useGeolocation();
  const cities = distanceToMajorCities(location);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="font-semibold text-stone-900">Distance</h2>
      {coords ? (
        <p className="mt-1 text-green-700">
          {haversineDistanceMiles(coords, location).toFixed(1)} mi from you
        </p>
      ) : (
        <p className="mt-1 text-sm text-stone-400">{error ?? "Locating…"}</p>
      )}
      <ul className="mt-3 space-y-1 text-sm text-stone-600">
        {cities.map(({ city, miles }) => (
          <li key={city.name}>
            {city.name}, {city.state} &mdash; {miles.toFixed(0)} mi
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Run: `npm test -- DistanceInfo.test.tsx` — Expected: 2 passed.

- [ ] **Step 5: Write the failing test for `NearbySpots`**

Create `src/components/__tests__/NearbySpots.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NearbySpots from "@/components/NearbySpots";
import type { Location } from "@/lib/types";

const target: Location = {
  id: "a", name: "Target", state: "OR", category: "hike", difficulty: "easy",
  lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};
const near: Location = { ...target, id: "b", name: "Nearby Spot", lat: 45.51, lng: -122.51 };
const far: Location = { ...target, id: "c", name: "Far Spot", lat: 47.6, lng: -122.33 };

describe("NearbySpots", () => {
  it("lists only spots within range, excluding the target", () => {
    render(<NearbySpots location={target} allLocations={[target, near, far]} maxMiles={10} />);
    expect(screen.getByText("Nearby Spot")).toBeInTheDocument();
    expect(screen.queryByText("Far Spot")).not.toBeInTheDocument();
    expect(screen.queryByText("Target")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing is nearby", () => {
    render(<NearbySpots location={target} allLocations={[target, far]} maxMiles={10} />);
    expect(screen.getByText(/no nearby spots/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails, then implement `NearbySpots`**

Run: `npm test -- NearbySpots.test.tsx` — expect FAIL (module not found).

Create `src/components/NearbySpots.tsx`:

```tsx
import { nearbyLocations } from "@/lib/distance";
import LocationCard from "@/components/LocationCard";
import type { Location } from "@/lib/types";

export interface NearbySpotsProps {
  location: Location;
  allLocations: Location[];
  maxMiles?: number;
}

export default function NearbySpots({ location, allLocations, maxMiles = 50 }: NearbySpotsProps) {
  const nearby = nearbyLocations(location, allLocations, maxMiles);

  if (nearby.length === 0) {
    return <p className="text-sm text-stone-500">No nearby spots within {maxMiles} miles yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {nearby.map(({ location: loc, miles }) => (
        <LocationCard key={loc.id} location={loc} distanceMiles={miles} />
      ))}
    </div>
  );
}
```

Run: `npm test -- NearbySpots.test.tsx` — Expected: 2 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add PhotoGallery, DistanceInfo, and NearbySpots components"
```

---

## Task 12: FavoriteButton component

**Files:**
- Create: `src/components/FavoriteButton.tsx`
- Test: `src/components/__tests__/FavoriteButton.test.tsx`

**Interfaces:**
- Consumes: `useFavorites` (Task 5).
- Produces: default export `FavoriteButton` with props `{ locationId: string }`. Used by the location detail page (Task 13).

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/FavoriteButton.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FavoriteButton from "@/components/FavoriteButton";

beforeEach(() => localStorage.clear());

describe("FavoriteButton", () => {
  it("toggles between 'Save' and 'Saved' on click", () => {
    render(<FavoriteButton locationId="multnomah-falls" />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(/save/i);

    fireEvent.click(button);
    expect(button).toHaveTextContent(/saved/i);

    fireEvent.click(button);
    expect(button).toHaveTextContent(/^save$/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- FavoriteButton.test.tsx`
Expected: FAIL — `@/components/FavoriteButton` module not found.

- [ ] **Step 3: Implement `FavoriteButton`**

Create `src/components/FavoriteButton.tsx`:

```tsx
"use client";

import { useFavorites } from "@/hooks/useFavorites";

export interface FavoriteButtonProps {
  locationId: string;
}

export default function FavoriteButton({ locationId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(locationId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(locationId)}
      className={
        saved
          ? "rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white"
          : "rounded-full border border-green-700 px-4 py-2 text-sm font-medium text-green-700"
      }
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- FavoriteButton.test.tsx`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add FavoriteButton component"
```

---

## Task 13: Location detail page

**Files:**
- Create: `src/app/locations/[id]/page.tsx`
- Test: `src/app/locations/[id]/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `getAllLocations`/`getLocationById` (Task 2), `PhotoGallery` (Task 11), `DistanceInfo` (Task 11), `NearbySpots` (Task 11), `FavoriteButton` (Task 12).

- [ ] **Step 1: Write the failing test**

Create `src/app/locations/[id]/__tests__/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({ coords: null, loading: false, error: "Locating disabled in test" }),
}));

import LocationPage, { generateStaticParams } from "@/app/locations/[id]/page";

describe("Location detail page", () => {
  it("renders the location name and description for a known id", async () => {
    const ui = await LocationPage({ params: Promise.resolve({ id: "multnomah-falls" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: /multnomah falls/i })).toBeInTheDocument();
    expect(screen.getByText(/waterfall/i)).toBeInTheDocument();
  });

  it("generates static params for every seed location", async () => {
    const params = await generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(5);
    expect(params.map((p) => p.id)).toContain("multnomah-falls");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- locations/\[id\]`
Expected: FAIL — `@/app/locations/[id]/page` module not found.

- [ ] **Step 3: Implement the location detail page**

Create `src/app/locations/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getAllLocations, getLocationById } from "@/data/locations";
import PhotoGallery from "@/components/PhotoGallery";
import DistanceInfo from "@/components/DistanceInfo";
import NearbySpots from "@/components/NearbySpots";
import FavoriteButton from "@/components/FavoriteButton";

export async function generateStaticParams() {
  return getAllLocations().map((loc) => ({ id: loc.id }));
}

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = getLocationById(id);

  if (!location) {
    notFound();
  }

  const allLocations = getAllLocations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{location.name}</h1>
          <p className="mt-1 text-stone-600">
            {location.state} &middot; {location.category} &middot; {location.difficulty}
          </p>
        </div>
        <FavoriteButton locationId={location.id} />
      </div>

      <PhotoGallery photos={location.photos} alt={location.name} />

      <p className="text-stone-800">{location.description}</p>

      {location.practicalInfo && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600">
          {location.practicalInfo.parking && <p>Parking: {location.practicalInfo.parking}</p>}
          {location.practicalInfo.fee && <p>Fee: {location.practicalInfo.fee}</p>}
          {location.practicalInfo.dogFriendly != null && (
            <p>Dog friendly: {location.practicalInfo.dogFriendly ? "Yes" : "No"}</p>
          )}
        </div>
      )}

      <DistanceInfo location={location} />

      <div>
        <h2 className="mb-2 font-semibold text-stone-900">Nearby spots</h2>
        <NearbySpots location={location} allLocations={allLocations} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- locations/\[id\]`
Expected: 2 passed.

- [ ] **Step 5: Manual browser check**

Run: `npm run dev`, visit `http://localhost:3000/locations/multnomah-falls` and `http://localhost:3000/locations/does-not-exist` (should show the Next.js not-found page).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add location detail page"
```

---

## Task 14: Passport (favorites) page

**Files:**
- Create: `src/components/PassportStats.tsx`
- Create: `src/app/passport/page.tsx`
- Test: `src/components/__tests__/PassportStats.test.tsx`
- Test: `src/app/passport/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `Location` (Task 2), `useFavorites` (Task 5), `getAllLocations` (Task 2), `LocationList` (Task 9).
- Produces: default export `PassportStats` with props `{ locations: Location[] }`.

- [ ] **Step 1: Write the failing test for `PassportStats`**

Create `src/components/__tests__/PassportStats.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PassportStats from "@/components/PassportStats";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  { id: "a", name: "A", state: "OR", category: "waterfall", difficulty: "easy", lat: 0, lng: 0, description: "", photos: [], createdAt: "2026-08-19" },
  { id: "b", name: "B", state: "OR", category: "hike", difficulty: "easy", lat: 0, lng: 0, description: "", photos: [], createdAt: "2026-08-19" },
  { id: "c", name: "C", state: "WA", category: "waterfall", difficulty: "easy", lat: 0, lng: 0, description: "", photos: [], createdAt: "2026-08-19" },
];

describe("PassportStats", () => {
  it("shows the total count and breakdowns by state and category", () => {
    render(<PassportStats locations={locations} />);
    expect(screen.getByText(/3 spots saved/i)).toBeInTheDocument();
    expect(screen.getByText(/OR: 2/)).toBeInTheDocument();
    expect(screen.getByText(/WA: 1/)).toBeInTheDocument();
    expect(screen.getByText(/waterfall: 2/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then implement `PassportStats`**

Run: `npm test -- PassportStats.test.tsx` — expect FAIL (module not found).

Create `src/components/PassportStats.tsx`:

```tsx
import type { Location } from "@/lib/types";

export interface PassportStatsProps {
  locations: Location[];
}

function countBy<T extends string>(locations: Location[], key: (loc: Location) => T): Record<string, number> {
  return locations.reduce<Record<string, number>>((acc, loc) => {
    const value = key(loc);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

export default function PassportStats({ locations }: PassportStatsProps) {
  const byState = countBy(locations, (loc) => loc.state);
  const byCategory = countBy(locations, (loc) => loc.category);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="font-semibold text-stone-900">{locations.length} spots saved</p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600">
        <div>
          {Object.entries(byState).map(([state, count]) => (
            <span key={state} className="mr-3">{state}: {count}</span>
          ))}
        </div>
        <div>
          {Object.entries(byCategory).map(([category, count]) => (
            <span key={category} className="mr-3">{category}: {count}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Run: `npm test -- PassportStats.test.tsx` — Expected: 1 passed.

- [ ] **Step 3: Write the failing test for the passport page**

Create `src/app/passport/__tests__/page.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { addFavorite } from "@/lib/favorites";
import PassportPage from "@/app/passport/page";

beforeEach(() => localStorage.clear());

describe("Passport page", () => {
  it("shows an empty state with no favorites", () => {
    render(<PassportPage />);
    expect(screen.getByText(/haven't saved any spots yet/i)).toBeInTheDocument();
  });

  it("lists favorited locations and stats once favorites exist", () => {
    addFavorite("multnomah-falls");
    addFavorite("smith-rock");
    render(<PassportPage />);
    expect(screen.getByText("Multnomah Falls")).toBeInTheDocument();
    expect(screen.getByText("Smith Rock State Park")).toBeInTheDocument();
    expect(screen.getByText(/2 spots saved/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- passport/__tests__/page.test.tsx`
Expected: FAIL — `@/app/passport/page` module not found.

- [ ] **Step 5: Implement the passport page**

Create `src/app/passport/page.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { getAllLocations } from "@/data/locations";
import LocationList from "@/components/LocationList";
import PassportStats from "@/components/PassportStats";

export default function PassportPage() {
  const { favoriteIds } = useFavorites();
  const allLocations = useMemo(() => getAllLocations(), []);
  const favorites = allLocations.filter((loc) => favoriteIds.includes(loc.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Your Passport</h1>
        <p className="mt-1 text-stone-600">Spots you&apos;ve saved to explore.</p>
      </div>

      {favorites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-stone-500">
          You haven&apos;t saved any spots yet — browse the map and hit Save on ones you like.
        </p>
      ) : (
        <>
          <PassportStats locations={favorites} />
          <LocationList locations={favorites} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- passport/__tests__/page.test.tsx`
Expected: 2 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add passport page with favorites stats"
```

---

## Task 15: Reviews database schema and access layer

**Files:**
- Create: `scripts/schema.sql`
- Create: `src/lib/db.ts`
- Create: `.env.local.example`
- Modify: `.gitignore` (confirm `.env*.local` is ignored — `create-next-app` already adds this; verify, don't duplicate)
- Test: `src/lib/__tests__/db.test.ts`

**Interfaces:**
- Produces: `ReviewRow` type and `insertReview(input: { locationId: string; rating: number; text: string; authorName?: string; ipAddress: string }): Promise<ReviewRow>`, `listReviewsForLocation(locationId: string): Promise<ReviewRow[]>`, `countRecentReviewsFromIp(ipAddress: string, sinceMinutes: number): Promise<number>` from `src/lib/db.ts`. Used by `src/lib/rateLimit.ts` (Task 16) and `src/app/api/reviews/route.ts` (Task 17).

- [ ] **Step 1: Write the schema**

Create `scripts/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  location_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  author_name TEXT,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_location_id_idx ON reviews (location_id);
CREATE INDEX IF NOT EXISTS reviews_ip_created_idx ON reviews (ip_address, created_at);
```

(`ip_address` is stored to support the rate limiter from Task 16 and is never returned to clients.)

- [ ] **Step 2: Document the local env setup**

Create `.env.local.example`:

```
# Postgres connection string for the reviews feature.
# For local dev, create a free Neon (https://neon.tech) project/branch,
# or point this at a local Postgres instance.
DATABASE_URL=postgres://user:password@localhost:5432/beavergreen
```

Confirm `.gitignore` already contains `.env*.local` (added by `create-next-app` by default) — if it's missing, append it.

- [ ] **Step 3: Write the failing tests for the DB access layer**

These tests mock the `pg` `Pool` so they run without a live database connection. Create `src/lib/__tests__/db.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();

vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation(() => ({ query: queryMock })),
}));

beforeEach(() => {
  queryMock.mockReset();
});

describe("db access layer", () => {
  it("insertReview inserts and returns the created row", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 1, location_id: "multnomah-falls", rating: 5, text: "Great!", author_name: "Alex", ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z" }],
    });

    const { insertReview } = await import("@/lib/db");
    const row = await insertReview({ locationId: "multnomah-falls", rating: 5, text: "Great!", authorName: "Alex", ipAddress: "1.2.3.4" });

    expect(row.id).toBe(1);
    expect(row.location_id).toBe("multnomah-falls");
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO reviews"),
      ["multnomah-falls", 5, "Great!", "Alex", "1.2.3.4"]
    );
  });

  it("listReviewsForLocation returns rows ordered newest-first", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 2, location_id: "multnomah-falls", rating: 4, text: "Nice", author_name: null, ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z" }],
    });

    const { listReviewsForLocation } = await import("@/lib/db");
    const rows = await listReviewsForLocation("multnomah-falls");

    expect(rows).toHaveLength(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY created_at DESC"),
      ["multnomah-falls"]
    );
  });

  it("countRecentReviewsFromIp returns the row count", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ count: "3" }] });

    const { countRecentReviewsFromIp } = await import("@/lib/db");
    const count = await countRecentReviewsFromIp("1.2.3.4", 60);

    expect(count).toBe(3);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("ip_address = $1"),
      ["1.2.3.4"]
    );
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- db.test.ts`
Expected: FAIL — `@/lib/db` module not found.

- [ ] **Step 5: Implement the DB access layer**

Create `src/lib/db.ts`:

```ts
import { Pool } from "pg";

export interface ReviewRow {
  id: number;
  location_id: string;
  rating: number;
  text: string;
  author_name: string | null;
  ip_address: string;
  created_at: string;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function insertReview(input: {
  locationId: string;
  rating: number;
  text: string;
  authorName?: string;
  ipAddress: string;
}): Promise<ReviewRow> {
  const result = await getPool().query(
    `INSERT INTO reviews (location_id, rating, text, author_name, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.locationId, input.rating, input.text, input.authorName ?? null, input.ipAddress]
  );
  return result.rows[0];
}

export async function listReviewsForLocation(locationId: string): Promise<ReviewRow[]> {
  const result = await getPool().query(
    `SELECT * FROM reviews WHERE location_id = $1 ORDER BY created_at DESC`,
    [locationId]
  );
  return result.rows;
}

export async function countRecentReviewsFromIp(ipAddress: string, sinceMinutes: number): Promise<number> {
  const result = await getPool().query(
    `SELECT COUNT(*) FROM reviews WHERE ip_address = $1 AND created_at > now() - ($2 || ' minutes')::interval`,
    [ipAddress, sinceMinutes]
  );
  return Number(result.rows[0].count);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- db.test.ts`
Expected: 3 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add reviews DB schema and access layer"
```

---

## Task 16: Rate limiting and reviews API route

**Files:**
- Create: `src/lib/rateLimit.ts`
- Create: `src/app/api/reviews/route.ts`
- Test: `src/lib/__tests__/rateLimit.test.ts`
- Test: `src/app/api/reviews/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `countRecentReviewsFromIp`, `insertReview`, `listReviewsForLocation` (Task 15).
- Produces: `isRateLimited(ipAddress: string): Promise<boolean>` from `src/lib/rateLimit.ts`; `GET`/`POST` handlers from `src/app/api/reviews/route.ts`. Used by `ReviewList`/`ReviewForm` (Task 17).

- [ ] **Step 1: Write the failing test for the rate limiter**

Create `src/lib/__tests__/rateLimit.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const countRecentReviewsFromIp = vi.fn();
vi.mock("@/lib/db", () => ({ countRecentReviewsFromIp }));

beforeEach(() => countRecentReviewsFromIp.mockReset());

describe("isRateLimited", () => {
  it("returns false when under the hourly threshold", async () => {
    countRecentReviewsFromIp.mockResolvedValueOnce(2);
    const { isRateLimited } = await import("@/lib/rateLimit");
    expect(await isRateLimited("1.2.3.4")).toBe(false);
  });

  it("returns true when at or over the hourly threshold", async () => {
    countRecentReviewsFromIp.mockResolvedValueOnce(5);
    const { isRateLimited } = await import("@/lib/rateLimit");
    expect(await isRateLimited("1.2.3.4")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then implement `rateLimit.ts`**

Run: `npm test -- rateLimit.test.ts` — expect FAIL (module not found).

Create `src/lib/rateLimit.ts`:

```ts
import { countRecentReviewsFromIp } from "@/lib/db";

const MAX_REVIEWS_PER_HOUR = 5;

export async function isRateLimited(ipAddress: string): Promise<boolean> {
  const count = await countRecentReviewsFromIp(ipAddress, 60);
  return count >= MAX_REVIEWS_PER_HOUR;
}
```

Run: `npm test -- rateLimit.test.ts` — Expected: 2 passed.

- [ ] **Step 3: Write the failing tests for the API route**

Create `src/app/api/reviews/__tests__/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const insertReview = vi.fn();
const listReviewsForLocation = vi.fn();
vi.mock("@/lib/db", () => ({ insertReview, listReviewsForLocation }));

const isRateLimited = vi.fn();
vi.mock("@/lib/rateLimit", () => ({ isRateLimited }));

beforeEach(() => {
  insertReview.mockReset();
  listReviewsForLocation.mockReset();
  isRateLimited.mockReset();
});

describe("GET /api/reviews", () => {
  it("returns reviews for the given locationId", async () => {
    listReviewsForLocation.mockResolvedValueOnce([
      { id: 1, location_id: "multnomah-falls", rating: 5, text: "Great!", author_name: "Alex", ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z" },
    ]);
    const { GET } = await import("@/app/api/reviews/route");

    const res = await GET(new Request("http://localhost/api/reviews?locationId=multnomah-falls"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([
      { id: 1, locationId: "multnomah-falls", rating: 5, text: "Great!", authorName: "Alex", createdAt: "2026-08-19T00:00:00.000Z" },
    ]);
  });

  it("returns 400 when locationId is missing", async () => {
    const { GET } = await import("@/app/api/reviews/route");
    const res = await GET(new Request("http://localhost/api/reviews"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/reviews", () => {
  const validBody = {
    locationId: "multnomah-falls",
    rating: 5,
    text: "Beautiful spot!",
    authorName: "Alex",
    honeypot: "",
  };

  function post(body: unknown) {
    return new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify(body),
    });
  }

  it("inserts a valid review and returns it", async () => {
    isRateLimited.mockResolvedValueOnce(false);
    insertReview.mockResolvedValueOnce({
      id: 1, location_id: "multnomah-falls", rating: 5, text: "Beautiful spot!", author_name: "Alex", ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z",
    });

    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post(validBody));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.locationId).toBe("multnomah-falls");
    expect(insertReview).toHaveBeenCalledWith({
      locationId: "multnomah-falls", rating: 5, text: "Beautiful spot!", authorName: "Alex", ipAddress: "1.2.3.4",
    });
  });

  it("silently rejects submissions with a filled honeypot field", async () => {
    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post({ ...validBody, honeypot: "bot filled this in" }));

    expect(res.status).toBe(201);
    expect(insertReview).not.toHaveBeenCalled();
  });

  it("rejects an invalid rating", async () => {
    isRateLimited.mockResolvedValueOnce(false);
    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post({ ...validBody, rating: 7 }));
    expect(res.status).toBe(400);
    expect(insertReview).not.toHaveBeenCalled();
  });

  it("returns 429 when rate-limited", async () => {
    isRateLimited.mockResolvedValueOnce(true);
    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post(validBody));
    expect(res.status).toBe(429);
    expect(insertReview).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- reviews/__tests__/route.test.ts`
Expected: FAIL — `@/app/api/reviews/route` module not found.

- [ ] **Step 5: Implement the API route**

Create `src/app/api/reviews/route.ts`:

```ts
import { NextResponse } from "next/server";
import { insertReview, listReviewsForLocation, type ReviewRow } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";

function toApiShape(row: ReviewRow) {
  return {
    id: row.id,
    locationId: row.location_id,
    rating: row.rating,
    text: row.text,
    authorName: row.author_name ?? undefined,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  const locationId = new URL(request.url).searchParams.get("locationId");
  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  const rows = await listReviewsForLocation(locationId);
  return NextResponse.json(rows.map(toApiShape));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { locationId, rating, text, authorName, honeypot } = body ?? {};

  // Bots that fill the hidden honeypot field get a fake success so they
  // don't learn to leave it blank, but nothing is written.
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (
    typeof locationId !== "string" ||
    typeof text !== "string" ||
    text.trim().length === 0 ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json({ error: "Invalid review submission" }, { status: 400 });
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await isRateLimited(ipAddress)) {
    return NextResponse.json({ error: "Too many reviews submitted recently" }, { status: 429 });
  }

  const row = await insertReview({
    locationId,
    rating,
    text,
    authorName: typeof authorName === "string" && authorName.trim() ? authorName.trim() : undefined,
    ipAddress,
  });

  return NextResponse.json(toApiShape(row), { status: 201 });
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- reviews/__tests__/route.test.ts`
Expected: 6 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add rate limiting and reviews API route"
```

---

## Task 17: ReviewList and ReviewForm components, wired into the location page

**Files:**
- Create: `src/components/ReviewList.tsx`
- Create: `src/components/ReviewForm.tsx`
- Modify: `src/app/locations/[id]/page.tsx`
- Test: `src/components/__tests__/ReviewList.test.tsx`
- Test: `src/components/__tests__/ReviewForm.test.tsx`

**Interfaces:**
- Consumes: the `/api/reviews` route (Task 16).
- Produces: default export `ReviewList` with props `{ locationId: string; refreshKey?: number }`; default export `ReviewForm` with props `{ locationId: string; onSubmitted?: () => void }`.

- [ ] **Step 1: Write the failing test for `ReviewList`**

Create `src/components/__tests__/ReviewList.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ReviewList from "@/components/ReviewList";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("ReviewList", () => {
  it("renders fetched reviews", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, locationId: "multnomah-falls", rating: 5, text: "Great!", authorName: "Alex", createdAt: "2026-08-19T00:00:00.000Z" },
      ],
    });

    render(<ReviewList locationId="multnomah-falls" />);

    await waitFor(() => expect(screen.getByText("Great!")).toBeInTheDocument());
    expect(screen.getByText(/Alex/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no reviews", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<ReviewList locationId="multnomah-falls" />);

    await waitFor(() => expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then implement `ReviewList`**

Run: `npm test -- ReviewList.test.tsx` — expect FAIL (module not found).

Create `src/components/ReviewList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface ApiReview {
  id: number;
  locationId: string;
  rating: number;
  text: string;
  authorName?: string;
  createdAt: string;
}

export interface ReviewListProps {
  locationId: string;
  refreshKey?: number;
}

export default function ReviewList({ locationId, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = useState<ApiReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReviews(null);
    setError(null);

    fetch(`/api/reviews?locationId=${encodeURIComponent(locationId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load reviews"))))
      .then((data: ApiReview[]) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load reviews right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [locationId, refreshKey]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (reviews === null) return <p className="text-sm text-stone-400">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="text-sm text-stone-500">No reviews yet — be the first.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border border-stone-200 bg-white p-3">
          <p className="text-sm font-medium text-stone-900">
            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            {review.authorName && <span className="ml-2 font-normal text-stone-500">by {review.authorName}</span>}
          </p>
          <p className="mt-1 text-stone-700">{review.text}</p>
        </li>
      ))}
    </ul>
  );
}
```

Run: `npm test -- ReviewList.test.tsx` — Expected: 2 passed.

- [ ] **Step 3: Write the failing test for `ReviewForm`**

Create `src/components/__tests__/ReviewForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewForm from "@/components/ReviewForm";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("ReviewForm", () => {
  it("submits the form and calls onSubmitted on success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const onSubmitted = vi.fn();

    render(<ReviewForm locationId="multnomah-falls" onSubmitted={onSubmitted} />);

    fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/your review/i), { target: { value: "Loved it" } });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      "/api/reviews",
      expect.objectContaining({ method: "POST" })
    );
    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const sentBody = JSON.parse(options.body as string);
    expect(sentBody).toMatchObject({ locationId: "multnomah-falls", rating: 4, text: "Loved it" });
  });

  it("shows an inline error when submission fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: "Too many reviews" }) });

    render(<ReviewForm locationId="multnomah-falls" />);

    fireEvent.change(screen.getByLabelText(/your review/i), { target: { value: "Loved it" } });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(screen.getByText(/too many reviews/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 4: Run test to verify it fails, then implement `ReviewForm`**

Run: `npm test -- ReviewForm.test.tsx` — expect FAIL (module not found).

Create `src/components/ReviewForm.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";

export interface ReviewFormProps {
  locationId: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({ locationId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locationId, rating, text, authorName, honeypot }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Couldn't submit your review right now.");
        return;
      }

      setText("");
      setAuthorName("");
      onSubmitted?.();
    } catch {
      setError("Couldn't submit your review right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4">
      <label className="flex flex-col text-sm text-stone-700">
        Rating
        <select
          aria-label="Rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-24 rounded border border-stone-300 px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-stone-700">
        Your review
        <textarea
          aria-label="Your review"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="mt-1 rounded border border-stone-300 px-2 py-1"
          rows={3}
        />
      </label>

      <label className="flex flex-col text-sm text-stone-700">
        Name (optional)
        <input
          aria-label="Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1 rounded border border-stone-300 px-2 py-1"
        />
      </label>

      <input
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute left-[-9999px]"
        name="website"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Submit review
      </button>
    </form>
  );
}
```

Run: `npm test -- ReviewForm.test.tsx` — Expected: 2 passed.

- [ ] **Step 5: Wire reviews into the location detail page**

Modify `src/app/locations/[id]/page.tsx`: this page is currently a Server Component (async, reads `params`), while reviews need client-side refresh-on-submit state. Extract a small client wrapper rather than converting the whole page to a client component. Create `src/components/ReviewsSection.tsx`:

```tsx
"use client";

import { useState } from "react";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";

export default function ReviewsSection({ locationId }: { locationId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-stone-900">Reviews</h2>
      <ReviewList locationId={locationId} refreshKey={refreshKey} />
      <ReviewForm locationId={locationId} onSubmitted={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
```

Then add the import and section to `src/app/locations/[id]/page.tsx`, immediately after the `NearbySpots` block:

```tsx
import ReviewsSection from "@/components/ReviewsSection";
```

```tsx
      <div>
        <h2 className="mb-2 font-semibold text-stone-900">Nearby spots</h2>
        <NearbySpots location={location} allLocations={allLocations} />
      </div>

      <ReviewsSection locationId={location.id} />
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all tests pass (the existing location-page test from Task 13 doesn't assert on reviews and should be unaffected; if it fails because `ReviewList`'s `fetch` call is unmocked in that test file, add `vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))` to its `beforeEach`).

- [ ] **Step 7: Manual browser check**

With `DATABASE_URL` pointed at a real Postgres (see Task 15's `.env.local.example`) and `psql "$DATABASE_URL" -f scripts/schema.sql` run once, start `npm run dev`, open a location page, submit a review, and confirm it appears in the list without a page reload.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add review list/form and wire reviews into the location page"
```

---

## Task 18: Push to GitHub

**Files:** none (repository operations only)

- [ ] **Step 1: Confirm repo visibility with the user**

Before running the next step, ask the user whether the new `beavergreen` GitHub repo should be public or private — this creates a resource visible to others and shouldn't default silently.

- [ ] **Step 2: Verify the production build one more time**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Create the GitHub repo and push**

```bash
cd "/Users/aryakrishnagiri/Downloads/in red/beavergreen"
gh repo create beavergreen --source=. --remote=origin --<visibility-from-step-1> --push
```

- [ ] **Step 4: Verify**

```bash
git remote -v
gh repo view aryakr4/beavergreen --web
```

Confirm the pushed repo on GitHub contains the full commit history from this plan.

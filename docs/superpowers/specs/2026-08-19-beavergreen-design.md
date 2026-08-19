# beavergreen — Design Spec

Date: 2026-08-19

## Purpose

A visual nature-exploration map covering Oregon and Washington that answers
"where should I go this weekend?" — not a trail-navigation tool (that's
AllTrails' job). Curated, incrementally-filled spots with real photos,
a personal write-up, distance info, and lightweight public reviews.

No AI APIs, no AI-generated content anywhere. All location content is
hand-authored by the site owner and stored in a local structured JSON
database, filled in incrementally with free stock/personal photos.

## Non-goals

- Not a hiking-directions / turn-by-turn trail app.
- No user accounts or login system.
- No "visited" tracking — the passport is the favorites list, not a
  checklist.
- No AI-written descriptions, tags, or summaries.

## Tech stack

- **Framework:** Next.js (App Router, TypeScript), deployed to Vercel
  (added later by the user).
- **Styling:** Tailwind CSS. Simple, clean, minimal UI — content and
  photos are the focus, not chrome.
- **Map:** `react-leaflet` + OpenStreetMap tiles. No API key, no billing,
  no usage caps.
- **Location data:** Local structured JSON, versioned in the repo,
  hand-edited by the owner over time.
- **Reviews data:** A small free Postgres database (Neon via the Vercel
  Postgres/Storage integration), since public review submissions must
  persist across requests and Vercel's filesystem is read-only in
  production. This is the *only* part of the app backed by a real
  database — everything else reads from the static JSON.
- **Favorites / Passport:** Client-only, `localStorage`. No backend, no
  accounts.

## Data model

### Location (JSON, `src/data/locations.json`)

```ts
type Location = {
  id: string;                 // slug, e.g. "multnomah-falls"
  name: string;
  state: "OR" | "WA";
  category: "waterfall" | "hike" | "viewpoint" | "lake" | "hot-spring" | "beach" | "forest" | "other";
  difficulty: "easy" | "moderate" | "hard";
  lat: number;
  lng: number;
  description: string;        // owner-written
  bestSeason?: string[];       // e.g. ["spring", "summer"]
  practicalInfo?: {
    parking?: string;
    fee?: string;
    dogFriendly?: boolean;
  };
  photos: string[];           // paths under /public/images/<id>/...
  createdAt: string;          // ISO date, when added to the site
};
```

Locations are added by editing this JSON (or splitting into
`src/data/locations/*.json` per spot if the file grows large) and
dropping photos into `public/images/<id>/`. No admin UI needed for v1 —
the owner edits files directly.

### Review (Postgres table `reviews`)

```
id          serial primary key
location_id text not null          -- matches Location.id
rating      smallint not null      -- 1-5
text        text not null
author_name text                   -- optional, free text, no auth
created_at  timestamptz default now()
```

Public, anonymous, auto-approved (goes live immediately) submission via
a POST API route. Spam mitigation for v1: a hidden honeypot field
rejected server-side, and basic IP-based rate limiting on the route
(e.g. N submissions per hour). No moderation queue in v1 — bad reviews
are deleted manually by the owner if needed (direct DB delete).

## Core features

### 1. Map + filtering (home page)

- Leaflet map of OR/WA with a pin per location, clustered if dense.
- Filter bar: category, state, difficulty, max distance from visitor.
- Filters recompute the visible pin set and an accompanying list/grid
  view client-side over the JSON — no server round-trip.
- List and map stay in sync (selecting a pin highlights the list item
  and vice versa).

### 2. Location detail page (`/locations/[id]`)

- Photo gallery, owner's write-up, category/difficulty/season badges.
- Distance section: live distance from the visitor (browser
  geolocation, permission-gated, graceful fallback text if denied/
  unavailable) and static distances to a fixed list of major OR/WA
  cities (Portland, Seattle, Eugene, Bend, Spokane, Vancouver WA, etc.)
  computed via the Haversine formula.
- Reviews list (from Postgres) + a submission form (rating + text +
  optional name, honeypot field).
- Favorite toggle button.

### 3. Favorites / Passport page (`/passport`)

- Reads favorited location IDs from `localStorage`.
- Renders them as a personal collection ("your passport") with simple
  stats: total count, breakdown by state and by category.
- No visited/checked-off state.

### 4. Nearby-location calculations

- Shared utility (`src/lib/distance.ts`) implementing Haversine
  distance between two lat/lng pairs, used by:
  - the max-distance filter (visitor → each location),
  - the location detail page's "distance from you" and "distance from
    major cities" sections,
  - a "nearby spots" module on the detail page (other locations within
    N miles, sorted by distance).

## Error handling

- Geolocation denied/unavailable → show a manual note ("enable
  location to see distance from you") and omit visitor-distance
  figures rather than blocking the page.
- Review submission failure (DB unreachable, rate-limited, honeypot
  tripped) → inline form error, no partial writes.
- Missing/broken photo paths → fall back to a placeholder image rather
  than a broken `<img>`.
- Empty filter results → explicit "no spots match" state, not a blank
  screen.

## Testing

- Unit tests for `src/lib/distance.ts` (Haversine correctness against
  known city-pair distances).
- Unit tests for filter logic (category/state/difficulty/distance
  combinations over fixture location data).
- API route tests for review submission (happy path, honeypot
  rejection, rate-limit rejection) against a test database.
- Manual browser check of map rendering, filter interaction, favorite
  toggle persistence, and the review form, before calling a milestone
  done.

## Repo / deployment

- New GitHub repo `beavergreen` under the `aryakr4` account, pushed
  from this project directory.
- Vercel project + Postgres integration added later by the user
  (not part of this build).
- `.env.local` (git-ignored) holds the Postgres connection string once
  the database is provisioned; until then, the reviews feature can be
  built against a local Postgres or a free Neon dev branch.

## Build order (high level, refined further in the implementation plan)

1. Repo scaffold (done), push to GitHub.
2. Location JSON schema + a handful of seed/sample locations with
   placeholder free-stock photos.
3. Map + filter UI on the home page.
4. Location detail page (content, distance sections, favorite toggle).
5. Distance utilities + "nearby spots" module.
6. Passport page (localStorage favorites).
7. Reviews: Postgres schema, API routes, submission form, display.
8. Polish pass: empty states, error states, responsive layout.

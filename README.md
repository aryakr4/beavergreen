# beavergreen

A visual nature-exploration map for Oregon and Washington. It answers "where
should I go this weekend?" — a curated, hand-filled collection of spots
(waterfalls, hikes, viewpoints, lakes, hot springs, beaches, forests), each
with real photos, a personal write-up, distance info, and lightweight public
reviews. It is not a trail-navigation app, has no user accounts, and no part
of the site content is AI-generated — everything is hand-authored by the
site owner.

## Adding a new location

Locations live in `src/data/locations.json`, a plain array of objects. The
shape is defined by the `Location` type in `src/lib/types.ts` — check there
for the full set of fields and which are optional. At a minimum:

```json
{
  "id": "some-place",
  "name": "Some Place",
  "state": "OR",
  "category": "waterfall",
  "difficulty": "easy",
  "lat": 45.1234,
  "lng": -122.1234,
  "description": "Your own notes about this spot.",
  "bestSeason": ["spring", "fall"],
  "practicalInfo": { "parking": "...", "fee": "Free", "dogFriendly": true },
  "photos": ["/images/some-place/photo1.jpg"],
  "createdAt": "2026-08-19"
}
```

- `id` should be a URL-safe slug (lowercase, hyphen-separated) — it's used
  both as the unique key and as the location's URL, `/locations/<id>`.
- `category` must be one of the values in the `Category` type
  (`src/lib/types.ts`), and `state` must be `"OR"` or `"WA"`.
- `bestSeason` and `practicalInfo` are optional; omit them if unknown.

Drop photos in `public/images/<id>/` and reference them in the `photos`
array as `/images/<id>/<filename>`. If no photos exist yet, point at
`/images/placeholder.svg` and swap it in later.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Reviews feature (optional, for local dev)

Everything on the site reads from the static JSON above except public
reviews, which are stored in Postgres so they persist across requests. This
is only needed if you want the review form/list to work locally:

1. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL` — a free
   [Neon](https://neon.tech) project works well, or point it at a local
   Postgres instance.
2. Run the schema against that database once:
   ```bash
   psql "$DATABASE_URL" -f scripts/schema.sql
   ```

## Verification

```bash
npm test          # unit + component tests (Vitest)
npm run build     # production build
```

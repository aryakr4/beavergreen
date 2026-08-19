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
      if (next[key] === undefined) delete next[key];
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

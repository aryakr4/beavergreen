"use client";

import type { ChangeEvent } from "react";
import type { LocationFilters } from "@/lib/filters";
import type { Category, Difficulty, USState } from "@/lib/types";

export interface FilterBarProps {
  filters: LocationFilters;
  onChange: (filters: LocationFilters) => void;
  disabled?: boolean;
}

const CATEGORIES: Category[] = ["waterfall", "hike", "viewpoint", "lake", "hot-spring", "beach", "forest", "other"];
const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard"];
const STATES: USState[] = ["OR", "WA"];

export default function FilterBar({ filters, onChange, disabled }: FilterBarProps) {
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
    <div className="flex flex-wrap gap-4 rounded-lg border border-oregon-blue/15 bg-white p-4">
      <label className="flex flex-col text-sm text-oregon-blue/80">
        Category
        <select
          aria-label="Category"
          value={filters.category ?? ""}
          onChange={handleSelect("category")}
          className="mt-1 rounded border border-oregon-blue/25 px-2 py-1"
        >
          <option value="">Any</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-oregon-blue/80">
        State
        <select
          aria-label="State"
          value={filters.state ?? ""}
          onChange={handleSelect("state")}
          className="mt-1 rounded border border-oregon-blue/25 px-2 py-1"
        >
          <option value="">Any</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-oregon-blue/80">
        Difficulty
        <select
          aria-label="Difficulty"
          value={filters.difficulty ?? ""}
          onChange={handleSelect("difficulty")}
          className="mt-1 rounded border border-oregon-blue/25 px-2 py-1"
        >
          <option value="">Any</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-oregon-blue/80">
        Max distance (miles)
        <input
          aria-label="Max distance"
          type="number"
          min={0}
          disabled={disabled}
          value={filters.maxDistanceMiles ?? ""}
          onChange={(e) =>
            update({ maxDistanceMiles: e.target.value ? Number(e.target.value) : undefined })
          }
          className="mt-1 w-28 rounded border border-oregon-blue/25 px-2 py-1 disabled:cursor-not-allowed disabled:bg-oregon-blue/5 disabled:text-oregon-blue/40"
        />
      </label>
    </div>
  );
}

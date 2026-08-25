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
    <div className="bevel-panel gloss-sheen overflow-hidden rounded-lg border border-oregon-blue-dark bg-gradient-to-b from-oregon-blue-light via-oregon-blue to-oregon-blue-dark p-4">
      <p className="relative z-[2] text-emboss text-lg font-bold text-gold">
        {locations.length} spots saved
      </p>
      <div className="relative z-[2] mt-3 flex flex-wrap gap-2 text-sm font-bold">
        {Object.entries(byState).map(([state, count]) => (
          <span
            key={state}
            className="bevel-raised rounded border border-steel-dark bg-gradient-to-b from-steel-light to-steel px-2 py-1 text-oregon-blue-dark"
          >
            {state}: {count}
          </span>
        ))}
        {Object.entries(byCategory).map(([category, count]) => (
          <span
            key={category}
            className="bevel-raised rounded border border-gold-dark bg-gradient-to-b from-gold-light to-gold px-2 py-1 text-oregon-blue-dark"
          >
            {category}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

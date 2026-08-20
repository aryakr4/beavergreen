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
    <div className="rounded-lg border border-fog/30 bg-white p-4">
      <p className="font-semibold text-basalt">{locations.length} spots saved</p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-basalt/70">
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

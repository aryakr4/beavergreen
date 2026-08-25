const PHRASES = [
  "OREGON",
  "BEAVER STATE",
  "ADMITTED FEB 14 1859",
  "33RD STATE",
  "PACIFIC NORTHWEST",
  "COLUMBIA RIVER",
  "WILLAMETTE VALLEY",
  "CASCADE RANGE",
  "MOUNT HOOD 11,239 FT",
  "CRATER LAKE",
  "DEEPEST LAKE IN THE U.S.",
  "HIGH DESERT",
  "TEMPERATE RAINFOREST",
  "PACIFIC OCEAN",
  "42° NORTH PARALLEL",
  "SNAKE RIVER",
  "SALEM",
  "PORTLAND",
  "EUGENE",
  "BEND",
  "SILICON FOREST",
  "TIMBER COUNTRY",
  "98,000 SQ MI",
  "WEST OF THE ROCKIES",
  "TRAILHEAD TO TRAILHEAD",
  "EST. 1859",
];

const LINE = PHRASES.join("   ·   ");
const ROWS = 40;

export default function BackgroundTexture() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <div className="absolute -inset-x-12 -inset-y-24 -rotate-3 text-[11px] font-bold uppercase leading-[2.2] tracking-widest text-oregon-blue-dark/[0.06]">
        {Array.from({ length: ROWS }, (_, i) => (
          <p key={i}>{LINE}</p>
        ))}
      </div>
    </div>
  );
}

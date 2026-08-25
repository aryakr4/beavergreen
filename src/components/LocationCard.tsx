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
      className="card-glint bevel-panel block overflow-hidden rounded-lg border border-steel bg-gradient-to-b from-white to-steel-light transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-40 w-full border-b border-steel bg-oregon-blue/5">
        <Image
          src={failed ? PLACEHOLDER : location.photos[0] ?? PLACEHOLDER}
          alt={location.name}
          fill
          className="object-cover"
          onError={() => setFailed(true)}
        />
        {distanceMiles != null && (
          <span className="bevel-raised absolute right-2 top-2 z-[2] rounded-full border border-gold-dark bg-gradient-to-b from-gold-light via-gold to-gold-dark px-2.5 py-1 text-xs font-bold text-oregon-blue-dark">
            {distanceMiles.toFixed(1)} mi away
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-oregon-blue-dark">{location.name}</h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-medium">
          <span className="bevel-raised rounded border border-steel-dark bg-gradient-to-b from-steel-light to-steel px-1.5 py-0.5 text-oregon-blue-dark">
            {location.state}
          </span>
          <span className="bevel-raised rounded border border-steel-dark bg-gradient-to-b from-steel-light to-steel px-1.5 py-0.5 text-oregon-blue-dark">
            {location.category}
          </span>
          <span className="bevel-raised rounded border border-washington-green-dark bg-gradient-to-b from-washington-green-light to-washington-green px-1.5 py-0.5 text-white">
            {location.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}

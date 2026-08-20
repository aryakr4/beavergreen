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
      className="block overflow-hidden rounded-lg border border-oregon-blue/15 bg-white transition hover:shadow-md"
    >
      <div className="relative h-40 w-full bg-oregon-blue/5">
        <Image
          src={failed ? PLACEHOLDER : location.photos[0] ?? PLACEHOLDER}
          alt={location.name}
          fill
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-oregon-blue">{location.name}</h3>
        <p className="mt-1 text-sm text-oregon-blue/70">
          {location.state} &middot; {location.category} &middot; {location.difficulty}
        </p>
        {distanceMiles != null && (
          <p className="mt-1 text-sm text-washington-green">{distanceMiles.toFixed(1)} mi away</p>
        )}
      </div>
    </Link>
  );
}

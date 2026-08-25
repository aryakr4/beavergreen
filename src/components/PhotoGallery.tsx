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
        <div
          key={src + i}
          className="bevel-raised relative h-48 overflow-hidden rounded-lg border border-steel-dark bg-gradient-to-b from-steel to-steel-dark p-1"
        >
          <div className="relative h-full w-full overflow-hidden rounded-md bg-oregon-blue/5">
            <Image
              src={failed[i] ? PLACEHOLDER : src}
              alt={`${alt} photo ${i + 1}`}
              fill
              className="object-cover"
              onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

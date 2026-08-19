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
        <div key={src + i} className="relative h-48 overflow-hidden rounded-lg bg-stone-100">
          <Image
            src={failed[i] ? PLACEHOLDER : src}
            alt={`${alt} photo ${i + 1}`}
            fill
            className="object-cover"
            onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlaceholderIcon } from "@/components/icons";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-background text-primary-light">
        <ImagePlaceholderIcon className="w-14 h-14" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
        <Image src={images[active]} alt={alt} fill unoptimized className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ảnh ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-200 cursor-pointer ${
                active === i ? "border-accent" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" unoptimized fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

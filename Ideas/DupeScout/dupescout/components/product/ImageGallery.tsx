"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const src = images[active] || "/placeholder-product.png";

  return (
    <div className="select-none">
      {/* Main image */}
      <div
        className="relative aspect-square bg-zinc-100 overflow-hidden cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={src}
          alt={`${productName} — image ${active + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, 480px"
          className="object-cover"
          priority={active === 0}
        />
        <button
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-zinc-600 hover:bg-white transition-colors"
          aria-label="Zoom"
          onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
        >
          <ZoomIn size={18} />
        </button>
        {/* Image counter */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
          {active + 1}/{images.length}
        </span>
      </div>

      {/* Dot indicators + thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 px-0.5">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                i === active ? "border-brand-500 opacity-100" : "border-transparent opacity-60 hover:opacity-80"
              )}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full max-w-lg aspect-square mx-4">
            <Image
              src={src}
              alt={productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <p className="absolute bottom-6 text-white/60 text-sm">Tap to close</p>
        </div>
      )}
    </div>
  );
}

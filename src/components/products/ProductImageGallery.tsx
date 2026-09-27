"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

type ProductImageGalleryProps = {
  imageUrl?: string | null;
  images?: string[] | null;
  productName: string;
};

export default function ProductImageGallery({
  imageUrl,
  images,
  productName,
}: ProductImageGalleryProps) {
  const gallery = Array.from(
    new Set(
      [imageUrl, ...(images ?? [])].filter(
        (url): url is string =>
          typeof url === "string" && url.trim().length > 0,
      ),
    ),
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const goNext = () => {
    if (gallery.length <= 1) return;

    setCurrentIndex((current) =>
      current === gallery.length - 1 ? 0 : current + 1,
    );
  };

  const goPrevious = () => {
    if (gallery.length <= 1) return;

    setCurrentIndex((current) =>
      current === 0 ? gallery.length - 1 : current - 1,
    );
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(event.targetTouches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      goNext();
    } else {
      goPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (gallery.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-gray-100">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="aspect-square w-full">
        <img
          src={gallery[currentIndex]}
          alt={`${productName} - image ${currentIndex + 1}`}
          className="h-full w-full select-none object-cover"
          draggable={false}
        />
      </div>

      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous product image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next product image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5">
            {gallery.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

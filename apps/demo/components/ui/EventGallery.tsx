"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGridIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

import { GalleryLightbox } from "./GalleryLightbox";

type EventGalleryProps = {
  /** Array of image URLs */
  images: string[];
  /** Alt text prefix for images */
  alt?: string;
  /** Maximum number of images to show in grid (default: 5) */
  maxImages?: number;
};

/**
 * EventGallery
 *
 * Bento-style image gallery with a large hero image on the left
 * and a 2x2 grid of smaller images on the right.
 * Click any image to open the full lightbox slideshow.
 *
 * Layout (5 images):
 * ┌──────────────┬────────┬────────┐
 * │              │   2    │   3    │
 * │      1       ├────────┼────────┤
 * │              │   4    │   5    │
 * └──────────────┴────────┴────────┘
 */
export function EventGallery({
  images,
  alt = "Event photo",
  maxImages = 5,
}: EventGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) return null;

  const displayImages = images.slice(0, maxImages);
  const remainingCount = images.length - maxImages;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Single image - full width
  if (images.length === 1) {
    return (
      <>
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Image
            src={images[0]!}
            alt={`${alt} 1`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </button>
        <GalleryLightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </>
    );
  }

  // Two images - side by side
  if (images.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          {displayImages.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => openLightbox(index)}
              className="relative aspect-[4/3] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                sizes="(max-width: 768px) 50vw, 600px"
              />
            </button>
          ))}
        </div>
        <GalleryLightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </>
    );
  }

  // Three or more images: Bento layout - large left, grid right
  const heroImage = displayImages[0]!;
  const gridImages = displayImages.slice(1, 5); // Max 4 on the right

  return (
    <>
      <div className="grid aspect-[2/1] grid-cols-1 gap-2 md:grid-cols-2">
        {/* Large hero image on the left */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="relative h-full w-full overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Image
            src={heroImage}
            alt={`${alt} 1`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </button>

        {/* 2x2 grid on the right - stretches to fill container height */}
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-2">
          {gridImages.map((src, index) => {
            const actualIndex = index + 1; // +1 because hero is index 0
            const isLastWithMore =
              actualIndex === displayImages.length - 1 && remainingCount > 0;

            return (
              <button
                key={index}
                type="button"
                onClick={() => openLightbox(actualIndex)}
                className={cn(
                  "relative h-full w-full overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isLastWithMore && "group",
                )}
              >
                <Image
                  src={src}
                  alt={`${alt} ${actualIndex + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-300",
                    isLastWithMore
                      ? "group-hover:scale-[1.02]"
                      : "hover:scale-[1.02]",
                  )}
                  sizes="(max-width: 768px) 25vw, 200px"
                />
                {isLastWithMore && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 transition-colors group-hover:bg-black/50">
                    <LayoutGridIcon className="size-5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      Show all photos
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <GalleryLightbox
        images={images}
        alt={alt}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}

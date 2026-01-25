"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGridIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

import { GalleryLightbox } from "./GalleryLightbox";

type HeroGalleryProps = {
  /** Array of image URLs */
  images: string[];
  /** Alt text prefix for images */
  alt?: string;
  /** Optional className for container */
  className?: string;
  /** Optional overlay actions (shown in top-right corner of gallery) */
  overlayActions?: React.ReactNode;
};

/**
 * HeroGallery
 *
 * Hero image gallery for event pages with responsive grid layouts.
 * Click any image to open the full lightbox slideshow.
 * Uses 2:1 aspect ratio (Airbnb-style).
 *
 * Mobile: Single hero image with optional overlay actions
 * Desktop:
 * - 1 image: Full width 2:1
 * - 2 images: 2/3 left + 1/3 top-right (blank below)
 * - 3 images: 2/3 left + 2 stacked right
 * - 4+ images: Same as 3, with "+N more" overlay on last
 */
export function HeroGallery({
  images,
  alt = "Event photo",
  className,
  overlayActions,
}: HeroGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const displayImages = images.slice(0, 3);
  const remainingCount = images.length - 3;

  // Shared button styles
  const buttonStyles =
    "relative overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  const imageStyles =
    "object-cover transition-transform duration-300 hover:scale-[1.02]";

  // Single image - full width
  if (images.length === 1) {
    return (
      <div className={cn("w-full", className)}>
        <div className="relative">
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className={cn(buttonStyles, "aspect-[4/3] w-full md:aspect-[2/1]")}
          >
            <Image
              src={images[0]!}
              alt={`${alt} 1`}
              fill
              className={imageStyles}
              sizes="(max-width: 768px) 100vw, 1280px"
            />
          </button>
          {/* Overlay actions */}
          {overlayActions && (
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {overlayActions}
            </div>
          )}
        </div>
        <GalleryLightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </div>
    );
  }

  // Two images - 2/3 left + 1/3 top-right (blank space below)
  if (images.length === 2) {
    return (
      <div className={cn("w-full", className)}>
        {/* Mobile: single hero image with overlay actions */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className={cn(buttonStyles, "aspect-[4/3] w-full")}
          >
            <Image
              src={images[0]!}
              alt={`${alt} 1`}
              fill
              className={imageStyles}
              sizes="100vw"
            />
          </button>
          {/* Image count indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            1 / {images.length}
          </div>
          {/* Overlay actions */}
          {overlayActions && (
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {overlayActions}
            </div>
          )}
        </div>

        {/* Desktop: grid layout */}
        <div className="relative hidden aspect-[2/1] grid-cols-3 grid-rows-2 gap-2 md:grid">
          {/* Large image - 2 cols, 2 rows */}
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className={cn(buttonStyles, "col-span-2 row-span-2 h-full w-full")}
          >
            <Image
              src={images[0]!}
              alt={`${alt} 1`}
              fill
              className={imageStyles}
              sizes="(max-width: 1280px) 66vw, 850px"
            />
          </button>
          {/* Small image - top right */}
          <button
            type="button"
            onClick={() => openLightbox(1)}
            className={cn(buttonStyles, "col-span-1 row-span-1 h-full w-full")}
          >
            <Image
              src={images[1]!}
              alt={`${alt} 2`}
              fill
              className={imageStyles}
              sizes="(max-width: 1280px) 33vw, 420px"
            />
          </button>
          {/* Blank space - bottom right (implicit, no element) */}
          {/* Overlay actions */}
          {overlayActions && (
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
              {overlayActions}
            </div>
          )}
        </div>

        <GalleryLightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </div>
    );
  }

  // Three or more images - 2/3 left + 2 stacked right
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: single hero image with overlay actions */}
      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className={cn(buttonStyles, "aspect-[4/3] w-full")}
        >
          <Image
            src={displayImages[0]!}
            alt={`${alt} 1`}
            fill
            className={imageStyles}
            sizes="100vw"
          />
        </button>
        {/* Image count indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          1 / {images.length}
        </div>
        {/* Overlay actions */}
        {overlayActions && (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {overlayActions}
          </div>
        )}
      </div>

      {/* Desktop: grid layout */}
      <div className="relative hidden aspect-[2/1] grid-cols-3 grid-rows-2 gap-2 md:grid">
        {/* Large image - 2 cols, 2 rows */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className={cn(buttonStyles, "col-span-2 row-span-2 h-full w-full")}
        >
          <Image
            src={displayImages[0]!}
            alt={`${alt} 1`}
            fill
            className={imageStyles}
            sizes="(max-width: 1280px) 66vw, 850px"
          />
        </button>

        {/* Top right image */}
        <button
          type="button"
          onClick={() => openLightbox(1)}
          className={cn(buttonStyles, "col-span-1 row-span-1 h-full w-full")}
        >
          <Image
            src={displayImages[1]!}
            alt={`${alt} 2`}
            fill
            className={imageStyles}
            sizes="(max-width: 1280px) 33vw, 420px"
          />
        </button>

        {/* Bottom right image (with +N overlay if 4+ images) */}
        <button
          type="button"
          onClick={() => openLightbox(2)}
          className={cn(
            buttonStyles,
            "col-span-1 row-span-1 h-full w-full",
            remainingCount > 0 && "group",
          )}
        >
          <Image
            src={displayImages[2]!}
            alt={`${alt} 3`}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              remainingCount > 0
                ? "group-hover:scale-[1.02]"
                : "hover:scale-[1.02]",
            )}
            sizes="(max-width: 1280px) 33vw, 420px"
          />
          {remainingCount > 0 && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 transition-colors group-hover:bg-black/50">
              <LayoutGridIcon className="size-5 text-white" />
              <span className="text-sm font-semibold text-white">
                +{remainingCount} more
              </span>
            </div>
          )}
        </button>

        {/* Overlay actions */}
        {overlayActions && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            {overlayActions}
          </div>
        )}
      </div>

      <GalleryLightbox
        images={images}
        alt={alt}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}

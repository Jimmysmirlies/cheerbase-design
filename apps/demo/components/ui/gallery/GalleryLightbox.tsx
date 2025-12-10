'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

type GalleryLightboxProps = {
  /** Array of image URLs */
  images: string[]
  /** Alt text prefix for images */
  alt?: string
  /** Initial image index to display */
  initialIndex?: number
  /** Whether the lightbox is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
}

/**
 * GalleryLightbox
 * 
 * Full-screen modal for viewing images in a slideshow format.
 * Uses React Portal to render at document body level.
 * Features:
 * - Dark overlay background
 * - Left/Right arrow navigation
 * - Keyboard navigation (Arrow keys, Escape)
 * - Click outside to close
 * - Dot indicators for current position
 */
export function GalleryLightbox({
  images,
  alt = 'Gallery image',
  initialIndex = 0,
  open,
  onOpenChange,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset to initial index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
    }
  }, [open, initialIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose, handlePrev, handleNext])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!mounted || !open || images.length === 0) return null

  const currentImage = images[currentIndex]

  const lightboxContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Dark overlay - click to close */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-6 top-6 z-20 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Close gallery"
      >
        <XIcon className="size-6" />
      </button>

      {/* Main image container - truly full screen */}
      <div className="relative z-10 h-screen w-screen">
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            className="object-contain p-4 sm:p-12 md:p-20"
            sizes="100vw"
            priority
          />
        )}
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-6 top-1/2 z-20 flex size-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="size-7" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-6 top-1/2 z-20 flex size-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Next image"
          >
            <ChevronRightIcon className="size-7" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      <div className="absolute bottom-8 right-8 z-20 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white/90">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )

  // Render via portal to document body
  return createPortal(lightboxContent, document.body)
}

"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon, BracesIcon, MousePointerClickIcon, PaletteIcon, PuzzleIcon, ScanIcon, TypeIcon } from "lucide-react"

import { Sidebar } from "@/components/layout/Sidebar"
import { NavBar } from "@/components/layout/NavBar"

// Style guide navigation map with nicknames for quick referencing in code.
const guideNavSections = [
  {
    label: "Style Guide",
    nickname: "style-guide-shell",
    items: [
      { key: "overview", label: "Overview", icon: <BookOpenIcon className="size-4" />, href: "/style-guide", nickname: "guide-overview" },
      { key: "colors", label: "Color Roles", icon: <PaletteIcon className="size-4" />, href: "/style-guide/colors", nickname: "guide-colors" },
      { key: "typography", label: "Typography", icon: <TypeIcon className="size-4" />, href: "/style-guide/typography", nickname: "guide-typography" },
      { key: "spacing", label: "Spacing & Radii", icon: <ScanIcon className="size-4" />, href: "/style-guide/spacing", nickname: "guide-spacing" },
      { key: "buttons", label: "Button Patterns", icon: <MousePointerClickIcon className="size-4" />, href: "/style-guide/buttons", nickname: "guide-buttons" },
      { key: "components", label: "Component Library", icon: <PuzzleIcon className="size-4" />, href: "/style-guide/components", nickname: "guide-components" },
      { key: "api-contracts", label: "API Contracts", icon: <BracesIcon className="size-4" />, href: "/style-guide/api-contracts", nickname: "guide-api-contracts" },
    ],
  },
]

export default function StyleGuideLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const navWrapperRef = useRef<HTMLDivElement | null>(null)
  const [navHeight, setNavHeight] = useState(72)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const active = useMemo(() => {
    if (!pathname) return "overview"
    if (pathname.includes("/colors")) return "colors"
    if (pathname.includes("/typography")) return "typography"
    if (pathname.includes("/spacing")) return "spacing"
    if (pathname.includes("/buttons")) return "buttons"
    if (pathname.includes("/components")) return "components"
    if (pathname.includes("/api-contracts")) return "api-contracts"
    return "overview"
  }, [pathname])

  useEffect(() => {
    const element = navWrapperRef.current
    if (!element) return

    const updateHeight = () => {
      const next = element.getBoundingClientRect().height
      if (!next) return
      setNavHeight(next)
    }

    updateHeight()

    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      const observer = new window.ResizeObserver(entries => {
        const entry = entries[0]
        if (!entry) return
        const next = entry.contentRect.height
        if (next) {
          setNavHeight(next)
        }
      })
      observer.observe(element)
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(max-width: 1023px)")
    const syncFromQuery = (target: Pick<MediaQueryList, "matches">) => {
      setIsMobile(target.matches)
      setIsSidebarOpen(target.matches ? false : true)
    }

    syncFromQuery(mediaQuery)
    const handler = (event: MediaQueryListEvent) => syncFromQuery(event)
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }

    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div ref={navWrapperRef} className="fixed inset-x-0 top-0 z-40">
        <NavBar showSidebarToggle={isMobile} sidebarOpen={isSidebarOpen} onSidebarToggle={() => setIsSidebarOpen(prev => !prev)} />
      </div>
      <Sidebar
        active={active}
        navSections={guideNavSections}
        navOffset={navHeight}
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
        supportTitle="Design System"
        supportText="Working on the guide? Ping the design systems team or email support@cheerbase.test."
      >
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-10 px-6 py-10 pb-20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Design Toolkit</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ralli Style Guide</h1>
            </div>
            <div className="hidden sm:block">
              <Link
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                href="/"
              >
                ← Back to marketplace
              </Link>
            </div>
          </div>
          {children}
        </main>
      </Sidebar>
    </div>
  )
}

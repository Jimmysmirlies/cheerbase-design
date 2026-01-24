"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@workspace/ui/shadcn/input";
import { SearchIcon } from "lucide-react";

import { eventCategories } from "@/data/events/categories";
import type { SearchItem } from "./types";

type NavBarSearchProps = {
  isNarrow: boolean;
  mobileSearchExpanded: boolean;
  setMobileSearchExpanded: (expanded: boolean) => void;
};

export function NavBarSearch({
  isNarrow,
  mobileSearchExpanded,
  setMobileSearchExpanded,
}: NavBarSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build event-only search list
  const eventSearchItems: SearchItem[] = useMemo(() => {
    return eventCategories.flatMap((category) =>
      category.events.map((event) => {
        const divisionNames =
          event.availableDivisions?.map((d) => d.name).join(" ") ?? "";
        return {
          label: event.name,
          href: `/events/${encodeURIComponent(event.id)}`,
          meta: `${event.organizer} · ${event.location} · ${event.date}`,
          searchText:
            `${event.name} ${event.organizer} ${event.location} ${divisionNames}`.toLowerCase(),
        };
      }),
    );
  }, []);

  // Debounce search term
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 220);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const filteredHits = useMemo(() => {
    const term = debouncedTerm.toLowerCase();
    if (!term) return [];
    const list = eventSearchItems.filter(
      (item) =>
        item.searchText?.includes(term) ??
        item.label.toLowerCase().includes(term),
    );
    return list.slice(0, 5);
  }, [debouncedTerm, eventSearchItems]);

  // Auto-focus mobile search input when expanded
  useEffect(() => {
    if (mobileSearchExpanded && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [mobileSearchExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setSearchOpen(false);
      setMobileSearchExpanded(false);
      router.push(`/events/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleResultClick = (href: string) => {
    setSearchOpen(false);
    setSearchTerm("");
    setMobileSearchExpanded(false);
    router.push(href);
  };

  const SearchResults = () => (
    <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-xl backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0">
      <ul className="divide-y divide-border/70">
        {filteredHits.length > 0 ? (
          filteredHits.map((item, idx) => (
            <li
              key={`${item.href}-${idx}`}
              className="dropdown-fade-in hover:bg-accent/40 focus-within:bg-accent/40 transition"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleResultClick(item.href)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {item.label}
                  </span>
                  {item.meta && (
                    <span className="text-xs text-muted-foreground">
                      {item.meta}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Enter</span>
              </button>
            </li>
          ))
        ) : (
          <li className="px-4 py-3 text-sm text-muted-foreground">
            No results yet
          </li>
        )}
      </ul>
    </div>
  );

  // Desktop search component (rendered inline in navbar row)
  const DesktopSearch = (
    <div className="hidden px-4 md:block md:flex-1 md:max-w-xl">
      <form className="relative w-full" onSubmit={handleSubmit}>
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.trim().length > 0) setSearchOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim().length > 0) setSearchOpen(true);
          }}
          onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
          placeholder="Search events, divisions, organizers, and locations"
          className="w-full rounded-full border border-border/60 bg-card/80 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        {searchOpen && debouncedTerm && <SearchResults />}
      </form>
    </div>
  );

  // Mobile search component (rendered outside navbar row to push content down)
  const MobileSearch = (
    <AnimatePresence>
      {mobileSearchExpanded && isNarrow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full overflow-hidden bg-sidebar/80 backdrop-blur-md md:hidden"
        >
          <div className="px-6 py-3">
            <form className="relative w-full" onSubmit={handleSubmit}>
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim().length > 0) setSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim().length > 0) setSearchOpen(true);
                }}
                onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                placeholder="Search events, divisions, organizers, and locations"
                className="w-full rounded-full border border-border/60 bg-card/80 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              {searchOpen && debouncedTerm && <SearchResults />}
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { DesktopSearch, MobileSearch };
}

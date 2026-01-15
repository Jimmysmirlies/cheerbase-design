export type SearchItem = {
  label: string;
  href: string;
  meta?: string;
  searchText?: string;
};

export type NavBarProps = {
  mode?: "default" | "clubs";
  variant?: "default" | "organizer";
  showNavLinks?: boolean;
  showSidebarToggle?: boolean;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  layoutVariant?: "A" | "B";
  onLayoutChange?: (variant: "A" | "B") => void;
  showLayoutToggle?: boolean;
};

export type SheetItem = {
  label: string;
  detail?: string;
  onClick: () => void;
};

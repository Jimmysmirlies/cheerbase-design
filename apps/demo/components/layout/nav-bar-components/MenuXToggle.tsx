"use client";

type MenuXToggleProps = {
  open: boolean;
};

export function MenuXToggle({ open }: MenuXToggleProps) {
  return (
    <span className="relative block h-4 w-5">
      <span
        className={`absolute left-0 block h-0.5 w-full rounded-sm bg-current transition-all duration-300 ${
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-full rounded-sm bg-current transition-all duration-300 ${
          open ? "top-1/2 opacity-0" : "top-1/2 -translate-y-1/2"
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-full rounded-sm bg-current transition-all duration-300 ${
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
        }`}
      />
    </span>
  );
}

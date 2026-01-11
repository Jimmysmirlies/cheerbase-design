import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// For card grids - fast stagger (80ms)
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// For page sections - slower, more noticeable stagger (150ms)
export const staggerSections: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// For inline expand/collapse editing cards
export const inlineExpandCollapse: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    marginTop: 0,
  },
  visible: {
    height: "auto",
    opacity: 1,
    marginTop: 16,
    transition: {
      height: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.2, ease: "easeOut", delay: 0.1 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    marginTop: 0,
    transition: {
      height: { duration: 0.25, ease: "easeIn" },
      opacity: { duration: 0.15, ease: "easeIn" },
    },
  },
};

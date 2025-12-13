import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

// For card grids - fast stagger (80ms)
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

// For page sections - slower, more noticeable stagger (150ms)
export const staggerSections: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
}

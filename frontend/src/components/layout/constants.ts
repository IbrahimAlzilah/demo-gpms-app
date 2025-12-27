/**
 * Shared layout constants and responsive utilities
 */

export const LAYOUT_CONSTANTS = {
  containerMaxWidth: 'max-w-8xl',
  headerHeight: 'h-16',
  // sidebarHeaderHeight: 'h-16',
} as const

/**
 * Responsive padding utilities
 * Mobile-first approach: base -> sm -> lg
 */
export const responsivePadding = {
  container: 'ps-3 pe-3 sm:ps-4 sm:pe-4 lg:ps-8 lg:pe-8',
  header: 'ps-3 pe-3 sm:ps-4 sm:pe-4 lg:ps-5 lg:pe-5',
  footer: 'ps-3 pe-3 sm:ps-4 sm:pe-4',
  sidebar: 'ps-4 pe-4',
} as const

export const responsiveSpacing = {
  content: 'py-4 sm:py-6',
  footer: 'py-3 sm:py-4',
  gap: 'gap-2 sm:gap-4',
  gapSmall: 'gap-1 sm:gap-2',
} as const


/**
 * RTL (Right-to-Left) utilities
 */

/**
 * Check if the current language is RTL
 */
export function isRTL(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.dir === 'rtl' || 
         document.documentElement.getAttribute('lang')?.startsWith('ar') ||
         false
}

/**
 * Get appropriate margin/padding classes for RTL
 */
export function getRTLClass(rtlClass: string, ltrClass: string = ''): string {
  return isRTL() ? rtlClass : ltrClass
}

/**
 * Get flex direction class for RTL
 */
export function getFlexDirection(rtl: 'row' | 'row-reverse' = 'row-reverse'): string {
  return isRTL() ? `flex-${rtl}` : 'flex-row'
}

/**
 * Get margin start class (ms-* for LTR, me-* for RTL)
 */
export function getMarginStart(className: string): string {
  if (isRTL()) {
    return className.replace(/^ms-/, 'me-')
  }
  return className.replace(/^me-/, 'ms-')
}

/**
 * Get margin end class (me-* for LTR, ms-* for RTL)
 */
export function getMarginEnd(className: string): string {
  if (isRTL()) {
    return className.replace(/^me-/, 'ms-')
  }
  return className.replace(/^ms-/, 'me-')
}

/**
 * Get padding start class (ps-* for LTR, pe-* for RTL)
 */
export function getPaddingStart(className: string): string {
  if (isRTL()) {
    return className.replace(/^ps-/, 'pe-')
  }
  return className.replace(/^pe-/, 'ps-')
}

/**
 * Get padding end class (pe-* for LTR, ps-* for RTL)
 */
export function getPaddingEnd(className: string): string {
  if (isRTL()) {
    return className.replace(/^pe-/, 'ps-')
  }
  return className.replace(/^ps-/, 'pe-')
}

/**
 * Get left/right classes based on direction
 */
export function getSideClass(leftClass: string, rightClass: string): string {
  return isRTL() ? rightClass : leftClass
}


import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSortingIcon(sortDirection: "asc" | "desc" | null) {
  if (sortDirection === "asc") return "↑"
  if (sortDirection === "desc") return "↓"
  return "⇅"
}

export function formatPaginationInfo(
  pageIndex: number,
  pageSize: number,
  totalCount: number
) {
  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalCount)
  return { start, end, total: totalCount }
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  range: number = 2
) {
  const pages: (number | string)[] = []
  
  if (totalPages <= range * 2 + 1) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (currentPage - range > 2) {
      pages.push("...")
    }
    
    // Show pages around current
    const start = Math.max(2, currentPage - range)
    const end = Math.min(totalPages - 1, currentPage + range)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (currentPage + range < totalPages - 1) {
      pages.push("...")
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  }
  
  return pages
}


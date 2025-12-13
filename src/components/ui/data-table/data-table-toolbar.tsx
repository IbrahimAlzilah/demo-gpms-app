import type { useReactTable } from "@tanstack/react-table"
import { X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  rtl?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "البحث...",
  rtl = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className={cn("relative", rtl && "flex-row-reverse")}>
          <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", rtl ? "right-3" : "left-3")} />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={cn("h-9 w-[150px] lg:w-[250px]", rtl && "pr-9", !rtl && "pl-9")}
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            إعادة تعيين
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}


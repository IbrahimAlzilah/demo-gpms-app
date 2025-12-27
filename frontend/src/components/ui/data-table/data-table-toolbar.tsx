import type { useReactTable } from "@tanstack/react-table"
import { X, Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation()
  const isFiltered = table.getState().columnFilters.length > 0
  const defaultPlaceholder = searchPlaceholder ?? t('dataTable.searchPlaceholder')

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={defaultPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-9 w-[150px] ps-9 lg:w-[250px]"
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('dataTable.resetFilters')}
            <X className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}


import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import type { useReactTable } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
    table: ReturnType<typeof useReactTable<TData>>
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    const { t } = useTranslation()
    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const pageCount = table.getPageCount()
    const totalRows = table.getFilteredRowModel().rows.length

    const start = pageIndex * pageSize + 1
    const end = Math.min((pageIndex + 1) * pageSize, totalRows)

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {totalRows > 0 ? (
                    t('dataTable.rowsInfo', { start, end, total: totalRows })
                ) : (
                    t('dataTable.noResults')
                )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    {t('dataTable.pageInfo', { page: pageIndex + 1, total: pageCount || 1 })}
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">{t('dataTable.goToFirstPage')}</span>
                        <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">{t('dataTable.goToPreviousPage')}</span>
                        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">{t('dataTable.goToNextPage')}</span>
                        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">{t('dataTable.goToLastPage')}</span>
                        <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                </div>
            </div>
        </div>
    )
}


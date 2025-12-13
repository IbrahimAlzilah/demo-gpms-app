import type { useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableViewOptionsProps<TData> {
    table: ReturnType<typeof useReactTable<TData>>
    rtl?: boolean
}

export function DataTableViewOptions<TData>({
    table,
    rtl = false,
}: DataTableViewOptionsProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn("ml-auto hidden h-8 lg:flex", rtl && "mr-auto ml-0")}
                >
                    <Settings2 className="ml-2 h-4 w-4" />
                    عرض
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={rtl ? "end" : "start"} className="w-[150px]">
                <DropdownMenuLabel>تبديل الأعمدة</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" && column.getCanHide()
                    )
                    .map((column) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                }
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


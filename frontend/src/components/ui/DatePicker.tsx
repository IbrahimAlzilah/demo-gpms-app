"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { Label } from "./label"
import type { Matcher } from "react-day-picker"

interface DatePickerProps {
  id?: string
  name?: string
  label?: string
  value?: string | Date
  onChange?: (date: string) => void
  placeholder?: string
  min?: string | Date
  max?: string | Date
  error?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  min,
  max,
  error,
  className,
  required,
  disabled
}: DatePickerProps) {
  const generatedId = React.useId()
  const inputId = id || generatedId

  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  })

  const [isOpen, setIsOpen] = React.useState(false)

  // Sync state with prop if it changes externally
  React.useEffect(() => {
    if (!value) {
      setDate(undefined)
      return
    }
    if (value instanceof Date) {
      setDate(value)
    } else {
      const parsed = parseISO(value)
      if (isValid(parsed)) setDate(parsed)
    }
  }, [value])

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    setIsOpen(false)
    if (onChange) {
      if (newDate) {
        onChange(format(newDate, "yyyy-MM-dd"))
      } else {
        onChange("")
      }
    }
  }

  // Calculate disabled days
  const disabledDays = React.useMemo(() => {
    const disabled: { before?: Date; after?: Date } = {}
    if (min) {
      disabled.before = min instanceof Date ? min : parseISO(min)
    }
    if (max) {
      disabled.after = max instanceof Date ? max : parseISO(max)
    }
    return disabled
  }, [min, max])

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
          {label} {required && "*"}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={inputId}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            disabled={disabledDays as Matcher}
            // Use required prop only if it is explicitly true
            required={required}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

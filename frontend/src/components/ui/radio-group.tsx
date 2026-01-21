"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type RadioGroupContextValue = {
  name: string
  value?: string
  onChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
}

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const groupName = React.useMemo(() => name ?? React.useId(), [name])

  const currentValue = value !== undefined ? value : internalValue

  const handleChange = (next: string) => {
    setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value: currentValue, onChange: handleChange }}
    >
      <div
        role="radiogroup"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, id, className, disabled, children, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext)
    const inputId = id ?? React.useId()

    if (!ctx) {
      throw new Error("RadioGroupItem must be used within a RadioGroup")
    }

    const checked = ctx.value === value

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "relative flex h-4 w-4 items-center justify-center rounded-full border border-input bg-background",
            checked && "border-primary"
          )}
        >
          <span
            className={cn(
              "block h-2.5 w-2.5 rounded-full bg-primary transition-opacity",
              checked ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          value={value}
          name={ctx.name}
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={() => ctx.onChange?.(value)}
          {...props}
        />
        {children}
      </label>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"


import * as React from "react"
import { cn } from "@/lib/utils"

const CollapsibleContext = React.createContext<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}>({
  isOpen: false,
  onOpenChange: () => {},
})

const Collapsible = React.forwardRef<
  HTMLDivElement,
  {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
  } & React.HTMLAttributes<HTMLDivElement>
>(({ open, onOpenChange, disabled, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setIsOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <CollapsibleContext.Provider value={{ isOpen, onOpenChange: handleOpenChange, disabled }}>
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        className={cn(className)}
        {...props}
      >
        {props.children}
      </div>
    </CollapsibleContext.Provider>
  )
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, asChild, ...props }, ref) => {
  // Use a default context value if context is missing, or handle it safely
  const context = React.useContext(CollapsibleContext)
  const { isOpen, onOpenChange, disabled } = context || { isOpen: false, onOpenChange: () => {}, disabled: false }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!disabled) {
      onOpenChange(!isOpen)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onClick: handleClick,
      "data-state": isOpen ? "open" : "closed",
      ...props,
    })
  }

  return (
    <button
      ref={ref}
      onClick={handleClick}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)
  const { isOpen } = context || { isOpen: false }

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      data-state="open"
      className={cn("overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

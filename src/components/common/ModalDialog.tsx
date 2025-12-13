import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Separator } from "@/components/ui";
import type { ReactNode } from "react";

interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  description?: string | ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  headerClassName?: string;
}

export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "lg",
  className,
  headerClassName,
}: ModalDialogProps) {
  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
  };

  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`!p-0 ${sizeClasses[size]} ${className}`}>
        <DialogHeader className={`p-5 !pb-1 ${headerClassName}`}>
          <DialogTitle className='text-base font-bold'>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Separator />
        <div className='flex-1 overflow-y-auto p-5 !pt-0 overflow-x-hidden'>{children}</div>
      </DialogContent>
    </Dialog>
  );
}

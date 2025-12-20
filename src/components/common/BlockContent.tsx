import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Skeleton } from "../ui";
import { cn } from "../../lib/utils";
import { Suspense } from "react";

interface BlockContentProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  shadow?: "sm" | "xs";
  className?: string;
  isWithSuspense?: boolean;
  suspenseFallback?: ReactNode;
  variant?: "card" | "container" | "data-table";
  printShadow?: boolean;
}

export const BlockContent = ({
  title,
  subtitle,
  children,
  actions,
  shadow = "sm",
  className = "",
  isWithSuspense = false,
  suspenseFallback,
  variant = "card",
  printShadow = false,
}: BlockContentProps) => {
  let content: ReactNode;

  if (variant === "container") {
    const containerClassName = `container mx-auto ${className}`.trim();
    content = <div className={containerClassName}>{children}</div>;
  } else {
    const shadowClass = shadow === "xs" ? "shadow-xs" : "shadow-sm";
    const cardClassName = `${shadowClass} border-none gap-0 !p-0 print:shadow-none print:border-0 ${className}`.trim();

    content = (
      <Card className={cn(printShadow ? "print:shadow-none print:border-0" : "", cardClassName)}>
        <CardHeader className='px-4 py-3'>
          <div className='flex justify-between items-center'>
            {title && <CardTitle className={`text-base ${!actions ? "leading-8" : ""}`}>{title}</CardTitle>}
            <div className='flex gap-2'>
              {actions && actions}
            </div>
          </div>
          {subtitle && <CardDescription className='text-sm text-muted-foreground'>{subtitle}</CardDescription>}
        </CardHeader>
        <Separator />
        <CardContent className='p-4'>{children}</CardContent>
      </Card>
    );
  }

  if (isWithSuspense) {
    return <Suspense fallback={suspenseFallback || <Skeleton />}>{content}</Suspense>;
  }

  return content;
};

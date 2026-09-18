"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StandardWidgetProps } from "./widget-layout";

export function StandardWidget({
  allowedSizes,
  label,
  icon,
  sublabel,
  children,
  className,
  contentClassName,
}: StandardWidgetProps) {
  return (
    <Card
      data-widget-allowed-sizes={allowedSizes.join(" ")}
      className={cn(
        "flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-none border p-0 shadow-none ring-0",
        className,
      )}
    >
      <CardHeader className="h-16 shrink-0 gap-1 overflow-hidden px-3 py-2.5">
        <CardTitle className="flex min-w-0 items-center gap-1.5 truncate text-sm [&>svg]:size-4">
          {icon}
          <span className="truncate">{label}</span>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {sublabel}
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          "min-h-0 flex-1 overflow-hidden p-3 pt-0",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

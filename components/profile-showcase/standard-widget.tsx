"use client";

import { GripVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StandardWidgetProps } from "./widget-layout";

export function StandardWidget({
  sizes,
  allowedSizes,
  label,
  icon,
  sublabel,
  children,
  editable = false,
  className,
  contentClassName,
}: StandardWidgetProps) {
  return (
    <Card
      data-widget-allowed-sizes={allowedSizes.join(" ")}
      data-widget-size-sm={sizes.sm}
      data-widget-size-md={sizes.md}
      data-widget-size-lg={sizes.lg}
      className={cn(
        "relative flex h-full min-h-0 min-w-0 flex-col gap-0 overflow-hidden rounded-none border p-0 shadow-none ring-0",
        className,
      )}
    >
      <CardHeader className="min-h-14 shrink-0 gap-1 overflow-hidden px-3 py-2 sm:min-h-16 sm:px-4 sm:py-2.5">
        <CardTitle
          className={cn(
            "flex min-w-0 items-center gap-1.5 truncate text-sm [&>svg]:size-4",
            editable && "pl-10 pr-10",
          )}
        >
          {editable ? (
            <span
              className="absolute left-0 top-0 flex h-14 w-10 cursor-grab items-center justify-center rounded-none border-r border-border/70 text-muted-foreground transition-colors hover:text-foreground sm:h-16"
              aria-label="Drag to reorder widget"
              title="Drag to reorder"
            >
              <GripVertical className="size-4" aria-hidden="true" />
            </span>
          ) : (
            icon
          )}
          <span className="truncate">{label}</span>
        </CardTitle>
        <CardDescription
          className={cn(
            "truncate whitespace-nowrap text-xs",
            editable && "px-10",
          )}
        >
          {sublabel}
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          "min-h-0 flex-1 overflow-hidden border-t border-border/70 p-1.5 transition-[max-height,opacity,padding] duration-300 ease-in-out sm:p-2",
          editable &&
            "max-sm:max-h-0 max-sm:flex-none max-sm:p-0 max-sm:opacity-0",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

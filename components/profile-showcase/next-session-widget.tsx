"use client";

import { Dumbbell } from "lucide-react";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize, WidgetSizes } from "./widget-layout";

export function NextSessionWidget({
  sizes = { sm: "2x2", md: "2x2", lg: "2x2" },
  allowedSizes = ["2x2"],
  editable,
}: {
  sizes?: WidgetSizes;
  allowedSizes?: readonly WidgetSize[];
  editable?: boolean;
}) {
  return (
    <StandardWidget
      sizes={sizes}
      allowedSizes={allowedSizes}
      label="Next session"
      icon={<Dumbbell aria-hidden="true" />}
      sublabel="Keep your training plan visible."
      editable={editable}
      contentClassName="flex"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-none border border-dashed bg-muted/30 p-1">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Dumbbell
            className="size-8 text-muted-foreground/50"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">No session scheduled</p>
          <p className="max-w-52 text-xs text-muted-foreground">
            Schedule a workout to keep your momentum going.
          </p>
        </div>
      </div>
    </StandardWidget>
  );
}

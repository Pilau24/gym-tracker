"use client";

import { BadgeCheck, Trophy } from "lucide-react";
import { memo } from "react";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize } from "./widget-layout";

export type AchievementItem = {
  label: string;
  status?: string;
};

export const AchievementsWidget = memo(function AchievementsWidget({
  items,
  allowedSizes,
}: {
  items: readonly AchievementItem[];
  allowedSizes: readonly WidgetSize[];
}) {
  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      label="Achievement showcase"
      icon={<Trophy aria-hidden="true" />}
      sublabel="Highlight your proudest milestones here when achievements are available."
    >
      <div className="grid h-full min-h-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
        {items.map(({ label, status = "Coming soon" }) => (
          <div
            key={label}
            className="flex min-h-0 flex-col items-center justify-center gap-0.5 rounded-none border border-dashed bg-muted/30 p-1.5 text-center"
          >
            <BadgeCheck
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-[10px] font-medium">{status}</span>
          </div>
        ))}
      </div>
    </StandardWidget>
  );
});

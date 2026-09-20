"use client";

import { BadgeCheck, Trophy } from "lucide-react";
import { memo } from "react";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize, WidgetSizes } from "./widget-layout";

export type AchievementItem = {
  id: string;
  label: string;
  status?: string;
};

export const AchievementsWidget = memo(function AchievementsWidget({
  items,
  settings,
  sizes,
  allowedSizes,
  editable,
}: {
  items: readonly AchievementItem[];
  settings: Record<string, unknown>;
  sizes: WidgetSizes;
  allowedSizes: readonly WidgetSize[];
  editable?: boolean;
}) {
  const pinnedItemIds = Array.isArray(settings.pinnedItemIds)
    ? settings.pinnedItemIds.filter(
        (value): value is string => typeof value === "string",
      )
    : null;
  const visibleItems =
    pinnedItemIds && pinnedItemIds.length > 0
      ? items.filter((item) => pinnedItemIds.includes(item.id))
      : items;

  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      sizes={sizes}
      label="Achievement showcase"
      icon={<Trophy aria-hidden="true" />}
      sublabel="Highlight your proudest milestones here when achievements are available."
      editable={editable}
    >
      <div className="grid h-full min-h-0 grid-cols-2 gap-1.5 lg:grid-cols-4">
        {visibleItems.map(({ id, label, status = "Coming soon" }) => (
          <div
            key={id}
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

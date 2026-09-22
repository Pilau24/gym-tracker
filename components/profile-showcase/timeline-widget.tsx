"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, Dumbbell, HeartPulse, Weight } from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize, WidgetSizes } from "./widget-layout";

export type TimelineItem = {
  date: string;
  id: string;
  time: string;
  title: string;
  type: "cardio" | "strength" | "weight";
};

const defaultTimelineItems: readonly TimelineItem[] = [
  {
    date: "2026-09-21",
    id: "weigh-in",
    time: "Today",
    title: "Weigh-in: 70 kg",
    type: "weight",
  },
  {
    date: "2026-09-20",
    id: "strength-1",
    time: "Yesterday",
    title: "Strength session",
    type: "strength",
  },
  {
    date: "2026-09-18",
    id: "strength-2",
    time: "3 days ago",
    title: "Strength session",
    type: "strength",
  },
  {
    date: "2026-09-16",
    id: "cardio",
    time: "5 days ago",
    title: "Cardio session",
    type: "cardio",
  },
  {
    date: "2026-09-14",
    id: "strength-3",
    time: "1 week ago",
    title: "Strength session",
    type: "strength",
  },
  {
    date: "2026-09-12",
    id: "weight-2",
    time: "1 week ago",
    title: "Weigh-in: 70.4 kg",
    type: "weight",
  },
  {
    date: "2026-09-10",
    id: "cardio-2",
    time: "11 days ago",
    title: "Cycling session",
    type: "cardio",
  },
  {
    date: "2026-09-08",
    id: "strength-4",
    time: "13 days ago",
    title: "Strength session",
    type: "strength",
  },
  {
    date: "2026-09-06",
    id: "strength-5",
    time: "2 weeks ago",
    title: "Upper body workout",
    type: "strength",
  },
  {
    date: "2026-09-04",
    id: "weight-3",
    time: "2 weeks ago",
    title: "Weigh-in: 70.8 kg",
    type: "weight",
  },
  {
    date: "2026-09-02",
    id: "cardio-3",
    time: "3 weeks ago",
    title: "Running session",
    type: "cardio",
  },
  {
    date: "2026-08-30",
    id: "strength-6",
    time: "3 weeks ago",
    title: "Lower body workout",
    type: "strength",
  },
  {
    date: "2026-08-28",
    id: "weight-4",
    time: "3 weeks ago",
    title: "Weigh-in: 71.1 kg",
    type: "weight",
  },
  {
    date: "2026-08-25",
    id: "cardio-4",
    time: "4 weeks ago",
    title: "Rowing session",
    type: "cardio",
  },
];
const TIMELINE_PAGE_SIZE = 10;

export function TimelineWidget({
  sizes = { sm: "2x2", md: "2x2", lg: "2x2" },
  allowedSizes = ["2x2"],
  editable,
  items = defaultTimelineItems,
}: {
  sizes?: WidgetSizes;
  allowedSizes?: readonly WidgetSize[];
  editable?: boolean;
  items?: readonly TimelineItem[];
}) {
  const [visibleCount, setVisibleCount] = useState(TIMELINE_PAGE_SIZE);
  const visibleItems = items.slice(0, visibleCount);
  const hasMoreItems = visibleItems.length < items.length;

  return (
    <StandardWidget
      sizes={sizes}
      allowedSizes={allowedSizes}
      label="Timeline"
      icon={<Activity aria-hidden="true" />}
      sublabel="Your training activity over time."
      editable={editable}
      contentClassName="flex"
    >
      <div className="min-h-0 flex-1 overflow-hidden rounded-none border border-dashed bg-muted/30">
        <ScrollArea
          className="h-full w-full [&>[data-slot=scroll-area-viewport]]:pr-2 [&>[data-slot=scroll-area-viewport]]:[scrollbar-gutter:stable]"
        >
          <div className="h-full">
            {items.length > 0 ? (
              <>
                <ItemGroup className="relative gap-2 py-2">
                  <span
                    className="pointer-events-none absolute bottom-0 left-5 top-0 border-l border-border"
                    aria-hidden="true"
                  />
                  {visibleItems.map((item) => (
                    <div key={item.id} className="relative flex min-w-0">
                      <span className="relative flex w-10 shrink-0 items-center justify-center">
                        <span className="relative z-10 flex size-6 items-center justify-center rounded-full border border-border bg-card p-1 ring-2 ring-card">
                          {item.type === "weight" ? (
                            <Weight className="size-3.5" aria-hidden="true" />
                          ) : item.type === "strength" ? (
                            <Dumbbell
                              className="size-3.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <HeartPulse
                              className="size-3.5"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </span>
                      <Item
                        size="xs"
                        variant="muted"
                        render={
                          <Link
                            href={`/activity/${item.date}`}
                            title={`${item.date} · ${item.time}`}
                          />
                        }
                        className="min-w-0 flex-1 rounded-none border-0 px-3 py-2.5"
                      >
                        <ItemContent className="gap-0">
                          <ItemDescription className="!text-[9px] leading-tight transition-colors group-hover/item:text-foreground group-hover/item:underline">
                            {item.time}
                          </ItemDescription>
                          <ItemTitle className="line-clamp-2 text-xs leading-snug font-normal">
                            {item.title}
                          </ItemTitle>
                        </ItemContent>
                      </Item>
                    </div>
                  ))}
                </ItemGroup>
                {hasMoreItems && (
                  <div className="flex justify-center px-2 pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="rounded-none"
                      onClick={() =>
                        setVisibleCount((count) => count + TIMELINE_PAGE_SIZE)
                      }
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 text-center">
                <Dumbbell
                  className="size-8 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="max-w-52 text-xs text-muted-foreground">
                  Log your first workout to start building your history.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </StandardWidget>
  );
}

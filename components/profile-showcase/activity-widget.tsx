"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize, WidgetSizes } from "./widget-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const activityLevels = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];
const activityGridPositionKey = "activity-grid-position";
const defaultActivitySizes: WidgetSizes = {
  sm: "2x2",
  md: "2x2",
  lg: "2x2",
};
const defaultActivityLabel = "Activity history";
const defaultActivitySublabel =
  "Your workouts, records, and other activity will appear here.";

function formatActivityDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function ActivityGrid({
  today = new Date(),
  rangeMonths = 12,
  endDate = today,
  onReady,
}: {
  today?: Date;
  rangeMonths?: number;
  endDate?: Date;
  onReady?: () => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const activityGridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [containerWidth, setContainerWidth] = useState(0);
  const displayEnd = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );
  const rangeStart = new Date(displayEnd);
  rangeStart.setMonth(rangeStart.getMonth() - rangeMonths);
  rangeStart.setDate(rangeStart.getDate() + 1);
  const baseCalendarStart = new Date(rangeStart);
  baseCalendarStart.setDate(rangeStart.getDate() - rangeStart.getDay());
  const calendarEnd = new Date(displayEnd);
  calendarEnd.setDate(displayEnd.getDate() + (6 - displayEnd.getDay()));
  const baseWeekCount =
    Math.floor(
      (calendarEnd.getTime() - baseCalendarStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ) + 1;
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const todayKey = today.toDateString();
  const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const tileGap = 4;
  const tileSize = 14;
  const minimumWeekCount =
    containerWidth > 0
      ? Math.ceil(
          (Math.max(containerWidth - 16, tileSize) + tileGap) /
            (tileSize + tileGap),
        )
      : baseWeekCount;
  const isMeasuring = containerWidth === 0;
  const renderWeekCount = isMeasuring
    ? Math.max(baseWeekCount, 104)
    : minimumWeekCount;
  const calendarStart = new Date(baseCalendarStart);
  calendarStart.setDate(
    baseCalendarStart.getDate() -
      Math.max(0, renderWeekCount - baseWeekCount) * 7,
  );
  const totalDays =
    Math.floor(
      (calendarEnd.getTime() - calendarStart.getTime()) / (24 * 60 * 60 * 1000),
    ) + 1;
  const activityDates = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
  const days = activityDates;
  const calendarDates = activityDates;
  const weeks = Array.from({ length: calendarDates.length / 7 }, (_, index) =>
    calendarDates.slice(index * 7, index * 7 + 7),
  );
  const paddedEndIndex = days.length - 1;
  const paddedEndWeekIndex = Math.floor(paddedEndIndex / 7);

  useEffect(() => {
    function updateViewportWidth() {
      setViewportWidth(window.innerWidth);
    }

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    function clearActiveTile(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !gridRef.current?.contains(event.target)
      ) {
        setActiveIndex(null);
      }
    }

    document.addEventListener("pointerdown", clearActiveTile);
    return () => {
      window.removeEventListener("resize", updateViewportWidth);
      document.removeEventListener("pointerdown", clearActiveTile);
    };
  }, []);

  useEffect(() => {
    function updateVisibleWeeks() {
      setContainerWidth(activityGridRef.current?.clientWidth ?? 0);
    }

    updateVisibleWeeks();
    const observer = new ResizeObserver(updateVisibleWeeks);
    if (activityGridRef.current) observer.observe(activityGridRef.current);
    return () => observer.disconnect();
  }, [tileGap, tileSize]);

  useEffect(() => {
    if (containerWidth > 0) onReady?.();
  }, [containerWidth, onReady]);

  const visibleWeeks = weeks.slice(0, paddedEndWeekIndex + 1);
  const visibleDays = days;
  const displayEndTime = displayEnd.getTime();
  const visibleWeekCount = visibleWeeks.length;

  useEffect(() => {
    const storedPosition = sessionStorage.getItem(activityGridPositionKey);
    const position = storedPosition
      ? (JSON.parse(storedPosition) as { pageY: number; gridX: number })
      : null;
    sessionStorage.removeItem(activityGridPositionKey);

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const viewport = activityGridRef.current?.querySelector<HTMLElement>(
          '[data-slot="scroll-area-viewport"]',
        );
        if (!viewport) return;

        if (position) {
          window.scrollTo({ top: position.pageY });
          const maxScrollLeft = Math.max(
            0,
            viewport.scrollWidth - viewport.clientWidth,
          );
          viewport.scrollLeft = Math.min(
            Math.max(position.gridX, 0),
            maxScrollLeft,
          );
          return;
        }

        viewport.scrollLeft = Math.max(
          0,
          viewport.scrollWidth - viewport.clientWidth,
        );
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [displayEndTime, rangeMonths, tileSize, visibleWeekCount]);

  function toggleActiveTile(index: number) {
    if (viewportWidth >= 700) return;
    setActiveIndex((current) => (current === index ? null : index));
  }

  function handleTilePointerUp(event: React.PointerEvent, index: number) {
    if (event.pointerType !== "touch") return;
    toggleActiveTile(index);
  }

  function preserveGridPosition() {
    const viewport = activityGridRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    sessionStorage.setItem(
      activityGridPositionKey,
      JSON.stringify({
        pageY: window.scrollY,
        gridX: viewport?.scrollLeft ?? 0,
      }),
    );
  }

  return (
    <div ref={gridRef} className="flex min-h-0 flex-col justify-between h-full">
      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-full gap-1">
        {isMeasuring ? (
          <Skeleton className="mt-4 h-[122px] w-5 shrink-0 rounded-none" />
        ) : (
          <div
            className="mt-4 grid w-5 shrink-0 items-center text-[8px] leading-3 text-muted-foreground"
            style={{
              gridTemplateRows: `repeat(7, ${tileSize}px)`,
              gap: tileGap,
            }}
          >
            {weekdayLabels.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
        )}
        <div
          ref={activityGridRef}
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <ScrollArea className="flex h-fit min-h-[154px] w-full flex-none flex-col [&>[data-slot=scroll-area-viewport]]:h-auto [&>[data-slot=scroll-area-viewport]]:flex-none">
            <div className="w-max min-w-full p-0.5">
              {isMeasuring ? (
                <Skeleton
                  className="h-[138px] rounded-none"
                  style={{
                    width: Math.max(
                      Math.max(baseWeekCount, 104) * (tileSize + tileGap) -
                        tileGap,
                      containerWidth,
                    ),
                  }}
                />
              ) : (
                <>
                  <div
                    className="grid w-max min-w-full items-center text-[8px] leading-3 text-muted-foreground"
                    style={{
                      gridTemplateColumns: `repeat(${visibleWeeks.length}, ${tileSize}px)`,
                      gap: tileGap,
                    }}
                  >
                    {visibleWeeks.map((week, index) => {
                      const firstOfMonth = week.find(
                        (date): date is Date =>
                          date !== null && date.getDate() === 1,
                      );
                      return (
                        <span key={index}>
                          {firstOfMonth
                            ? monthFormatter.format(firstOfMonth)
                            : ""}
                        </span>
                      );
                    })}
                  </div>
                  <div
                    className="mt-1 grid w-max min-w-full grid-flow-col grid-rows-7"
                    style={{
                      gridTemplateColumns: `repeat(${visibleWeeks.length}, ${tileSize}px)`,
                      gap: tileGap,
                    }}
                  >
                    {visibleDays.map((date, index) => {
                      const isInRange =
                        date >= rangeStart && date <= displayEnd;
                      const isToday =
                        isInRange && date.toDateString() === todayKey;
                      const isHighlighted =
                        activeIndex === index || hoveredIndex === index;
                      const tileProps = {
                        onPointerUp: (event: React.PointerEvent) =>
                          handleTilePointerUp(event, index),
                        onMouseEnter: () => setHoveredIndex(index),
                        onMouseLeave: () => setHoveredIndex(null),
                        style: {
                          width: tileSize,
                          height: tileSize,
                          transform: isHighlighted ? "scale(1.1)" : undefined,
                          zIndex: isHighlighted ? 1 : undefined,
                        },
                      };

                      return isInRange ? (
                        <Link
                          key={date.toISOString()}
                          href={`/activity/${formatActivityDate(date)}`}
                          onClick={preserveGridPosition}
                          {...tileProps}
                          aria-label={`${dateFormatter.format(date)}: No activity`}
                          className={`relative transition-transform duration-100 ${activityLevels[0]} ${
                            isToday ? "ring-1 ring-inset ring-primary/45" : ""
                          }`}
                          title={`${dateFormatter.format(date)}: No activity`}
                        />
                      ) : (
                        <span
                          key={`empty-${index}`}
                          {...tileProps}
                          aria-disabled="true"
                          aria-label={`${dateFormatter.format(date)}: Outside selected range`}
                          className="relative bg-muted/40 opacity-45 transition-transform duration-100"
                          title={`${dateFormatter.format(date)}: Outside selected range`}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      <Separator />
      <div className="mt-0 flex w-full shrink-0 items-center justify-end gap-1 p-0.5 text-[10px] text-muted-foreground">
        {isMeasuring ? (
          <Skeleton className="h-3 w-24 rounded-none" />
        ) : (
          <>
            <span className="mr-0.5">Less</span>
            {activityLevels.map((level) => (
              <span
                key={level}
                className={`size-2.5 ${level}`}
                aria-hidden="true"
              />
            ))}
            <span className="ml-0.5">More</span>
          </>
        )}
      </div>
    </div>
  );
}

export type ActivityWidgetProps = {
  today?: Date;
  endDate?: Date;
  rangeMonths?: number;
  label?: string;
  sublabel?: string;
  sizes?: WidgetSizes;
  allowedSizes?: readonly WidgetSize[];
  editable?: boolean;
};

export const ActivityWidget = memo(function ActivityWidget({
  today,
  endDate,
  rangeMonths,
  label = defaultActivityLabel,
  sublabel = defaultActivitySublabel,
  sizes,
  allowedSizes,
  editable,
}: ActivityWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <StandardWidget
      allowedSizes={allowedSizes ?? ["2x2"]}
      sizes={sizes ?? defaultActivitySizes}
      label={label}
      icon={<Activity aria-hidden="true" />}
      sublabel={sublabel}
      editable={editable}
      loading={isLoading}
      contentClassName="flex"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-none border border-dashed bg-muted/30 p-1">
        <div className="size-full">
          <ActivityGrid
            today={today}
            endDate={endDate}
            rangeMonths={rangeMonths}
            onReady={() => setIsLoading(false)}
          />
        </div>
      </div>
    </StandardWidget>
  );
});

"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize, WidgetSizes } from "./widget-layout";
import { ScrollArea } from "@/components/ui/scroll-area";

const activityLevels = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function formatActivityDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function ActivityGrid({
  today = new Date(),
  rangeMonths = 12,
  endDate = today,
}: {
  today?: Date;
  rangeMonths?: number;
  endDate?: Date;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const activityGridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
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
  const tileGap = containerSize.width > 0 && containerSize.width < 360 ? 2 : 4;
  const widthTileSize =
    viewportWidth < 420 ? 10 : viewportWidth < 700 ? 14 : 18;
  const heightTileSize =
    containerSize.height > 0
      ? Math.floor((containerSize.height - 22 - tileGap * 6) / 7)
      : widthTileSize;
  const tileSize = Math.max(8, Math.min(widthTileSize, heightTileSize));
  const minimumWeekCount =
    containerSize.width > 0
      ? Math.ceil(
          (Math.max(containerSize.width - 16, tileSize) + tileGap) /
            (tileSize + tileGap),
        )
      : baseWeekCount;
  const autoFilledWeeks = minimumWeekCount > baseWeekCount;
  const calendarStart = new Date(baseCalendarStart);
  calendarStart.setDate(
    baseCalendarStart.getDate() -
      Math.max(0, minimumWeekCount - baseWeekCount) * 7,
  );
  const totalDays =
    Math.floor(
      (calendarEnd.getTime() - calendarStart.getTime()) /
        (24 * 60 * 60 * 1000),
    ) + 1;
  const activityDates = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
  const days = activityDates;
  const calendarDates = activityDates;
  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, index) => calendarDates.slice(index * 7, index * 7 + 7),
  );
  const scrollAreaHeight = 14 + tileSize * 7 + tileGap * 6 + 32;
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
      setContainerSize({
        width: activityGridRef.current?.clientWidth ?? 0,
        height: gridRef.current?.clientHeight ?? 0,
      });
    }

    updateVisibleWeeks();
    const observer = new ResizeObserver(updateVisibleWeeks);
    if (gridRef.current) observer.observe(gridRef.current);
    if (activityGridRef.current) observer.observe(activityGridRef.current);
    return () => observer.disconnect();
  }, [tileGap, tileSize]);

  const visibleWeeks = weeks.slice(0, paddedEndWeekIndex + 1);
  const visibleDays = days;
  const displayEndTime = displayEnd.getTime();
  const visibleWeekCount = visibleWeeks.length;

  useEffect(() => {
    const viewport = activityGridRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) {
      viewport.scrollLeft = viewport.scrollWidth;
    }
  }, [displayEndTime, rangeMonths, tileSize, visibleWeekCount]);

  function toggleActiveTile(index: number) {
    if (viewportWidth >= 700) return;
    setActiveIndex((current) => (current === index ? null : index));
  }

  function handleTilePointerUp(event: React.PointerEvent, index: number) {
    if (event.pointerType !== "touch") return;
    toggleActiveTile(index);
  }

  return (
    <div ref={gridRef} className="flex flex-col justify-start">
      <div className="mx-auto flex w-full min-w-0 max-w-full gap-1">
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
        <div
          ref={activityGridRef}
          className="min-w-0 flex-1"
        >
          <ScrollArea
            className={`w-full ${
              autoFilledWeeks
                ? "[&_[data-orientation=horizontal]]:hidden"
                : ""
            }`}
            style={{ height: scrollAreaHeight }}
          >
            <div className="w-max min-w-full p-2 pb-5">
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
                      {firstOfMonth ? monthFormatter.format(firstOfMonth) : ""}
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
                  const isInRange = date >= rangeStart && date <= displayEnd;
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
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="mt-0 flex w-full shrink-0 items-center justify-end gap-1 border-t px-3 py-3 text-[10px] text-muted-foreground sm:px-4">
        <span className="mr-0.5">Less</span>
        {activityLevels.map((level) => (
          <span
            key={level}
            className={`size-2.5 ${level}`}
            aria-hidden="true"
          />
        ))}
        <span className="ml-0.5">More</span>
      </div>
    </div>
  );
}

export const ActivityWidget = memo(function ActivityWidget({
  today,
  sizes,
  allowedSizes,
  editable,
}: {
  today?: Date;
  sizes: WidgetSizes;
  allowedSizes: readonly WidgetSize[];
  editable?: boolean;
}) {
  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      sizes={sizes}
      label="Recent activity"
      icon={<Activity aria-hidden="true" />}
      sublabel="Your workouts, records, and other activity will appear here."
      editable={editable}
      contentClassName="flex"
    >
      <div className="min-h-0 flex-1 overflow-hidden rounded-none border border-dashed bg-muted/30 p-1">
        <ActivityGrid today={today} />
      </div>
    </StandardWidget>
  );
});

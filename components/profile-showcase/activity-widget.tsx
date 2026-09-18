"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize } from "./widget-layout";

const activityLevels = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function getActivityLevel(dayIndex: number) {
  if (dayIndex % 29 === 4 || dayIndex % 37 === 15) return 4;
  if (dayIndex % 17 === 3 || dayIndex % 23 === 8) return 3;
  if (dayIndex % 11 === 2 || dayIndex % 19 === 6) return 2;
  if (dayIndex % 7 === 1) return 1;
  return 0;
}

function ActivityGrid({ today = new Date() }: { today?: Date }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const activityGridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [visibleWeekCount, setVisibleWeekCount] = useState(
    Number.MAX_SAFE_INTEGER,
  );
  const rangeMonths = 12;
  const start = new Date(
    today.getFullYear(),
    today.getMonth() - (rangeMonths - 2),
    1,
  );
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const leadingBlanks = start.getDay();
  const calendarDates = Array.from(
    { length: leadingBlanks + totalDays },
    (_, index) => {
      if (index < leadingBlanks) return null;
      const date = new Date(start);
      date.setDate(start.getDate() + index - leadingBlanks);
      return date;
    },
  );
  const days = calendarDates.map((date) =>
    date && date <= today ? date : null,
  );
  while (days.length % 7 !== 0) days.push(null);
  while (calendarDates.length < days.length) calendarDates.push(null);

  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, index) => calendarDates.slice(index * 7, index * 7 + 7),
  );
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const todayKey = today.toDateString();
  const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const tileSize = viewportWidth < 420 ? 14 : viewportWidth < 700 ? 16 : 18;
  const tileGap = 4;
  const todayIndex =
    leadingBlanks +
    Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const paddedEndIndex = Math.min(days.length - 1, todayIndex + 28);
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
      const width = activityGridRef.current?.clientWidth ?? 0;
      setVisibleWeekCount(
        width > 0
          ? Math.max(
              1,
              Math.floor((width + tileGap) / (tileSize + tileGap)),
            )
          : Number.MAX_SAFE_INTEGER,
      );
    }

    updateVisibleWeeks();
    const observer = new ResizeObserver(updateVisibleWeeks);
    if (activityGridRef.current) observer.observe(activityGridRef.current);
    return () => observer.disconnect();
  }, [tileSize]);

  const firstVisibleWeek = Math.max(
    0,
    paddedEndWeekIndex - visibleWeekCount + 1,
  );
  const visibleWeeks = weeks.slice(firstVisibleWeek, paddedEndWeekIndex + 1);
  const visibleDays = days.slice(firstVisibleWeek * 7, paddedEndIndex + 1);

  function toggleActiveTile(index: number) {
    if (viewportWidth >= 700) return;
    setActiveIndex((current) => (current === index ? null : index));
  }

  function handleTilePointerUp(event: React.PointerEvent, index: number) {
    if (event.pointerType !== "touch") return;
    toggleActiveTile(index);
  }

  return (
    <div ref={gridRef} className="flex h-full min-h-0 items-center">
      <div className="mx-auto flex min-w-0 max-w-full gap-2">
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
          className="flex min-w-0 flex-1 flex-col items-center overflow-visible"
        >
          <div
            className="grid items-center text-[8px] leading-3 text-muted-foreground"
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
            className="mt-1 grid grid-flow-col grid-rows-7"
            style={{
              gridTemplateColumns: `repeat(${visibleWeeks.length}, ${tileSize}px)`,
              gap: tileGap,
            }}
          >
            {visibleDays.map((date, index) => {
              const level = getActivityLevel(index);
              const isToday = date?.toDateString() === todayKey;
              const isHighlighted =
                activeIndex === index || hoveredIndex === index;
              const tileProps = {
                role: "button" as const,
                tabIndex: 0,
                "aria-pressed": activeIndex === index,
                onPointerUp: (event: React.PointerEvent) =>
                  handleTilePointerUp(event, index),
                onKeyDown: (event: React.KeyboardEvent) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleActiveTile(index);
                  }
                },
                onMouseEnter: () => setHoveredIndex(index),
                onMouseLeave: () => setHoveredIndex(null),
                style: {
                  width: tileSize,
                  height: tileSize,
                  transform: isHighlighted ? "scale(1.1)" : undefined,
                  zIndex: isHighlighted ? 1 : undefined,
                },
              };

              return date ? (
                <span
                  key={date.toISOString()}
                  {...tileProps}
                  aria-label={`${dateFormatter.format(date)}: ${level} contributions`}
                  className={`relative transition-transform duration-100 ${activityLevels[level]} ${
                    isToday ? "ring-1 ring-inset ring-primary/45" : ""
                  }`}
                  title={`${dateFormatter.format(date)}: ${level} contributions`}
                />
              ) : (
                <span
                  key={`empty-${index}`}
                  {...tileProps}
                  aria-label="No activity"
                  className="relative bg-muted/40 transition-transform duration-100"
                />
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 text-[8px] text-muted-foreground">
            <span>Less</span>
            {activityLevels.map((level) => (
              <span
                key={level}
                className={`size-3 ${level}`}
                aria-hidden="true"
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ActivityWidget = memo(function ActivityWidget({
  today,
  allowedSizes,
}: {
  today?: Date;
  allowedSizes: readonly WidgetSize[];
}) {
  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      label="Recent activity"
      icon={<Activity aria-hidden="true" />}
      sublabel="Your workouts, records, and other activity will appear here."
      contentClassName="flex"
    >
      <div className="min-h-0 flex-1 overflow-hidden rounded-none border border-dashed bg-muted/30 p-2">
        <ActivityGrid today={today} />
      </div>
    </StandardWidget>
  );
});

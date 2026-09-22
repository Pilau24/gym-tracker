"use client";

import { useState } from "react";
import { ActivityWidget } from "@/components/profile-showcase/activity-widget";
import { TimelineWidget } from "@/components/profile-showcase/timeline-widget";
import { HeroStats } from "@/components/hero-stats";
import {
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActivityPage() {
  const [rangeMonths, setRangeMonths] = useState(12);
  const [periodEnd, setPeriodEnd] = useState(() => new Date());
  const today = new Date();
  const isCurrentPeriod =
    periodEnd >= today || periodEnd.toDateString() === today.toDateString();
  const periodStart = new Date(
    periodEnd.getFullYear(),
    periodEnd.getMonth(),
    periodEnd.getDate(),
  );
  periodStart.setMonth(periodStart.getMonth() - rangeMonths);
  periodStart.setDate(periodStart.getDate() + 1);
  const periodFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function movePeriod(direction: -1 | 1) {
    const nextEnd = new Date(periodEnd);
    nextEnd.setMonth(nextEnd.getMonth() + direction * rangeMonths);
    if (nextEnd > today) {
      setPeriodEnd(today);
      return;
    }
    setPeriodEnd(nextEnd);
  }

  return (
    <div className="min-h-full bg-muted/30 px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="relative">
          <div className="relative z-10 flex flex-col gap-3 pb-5 pt-4">
            <header>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Progress
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Activity
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review workouts, milestones, and consistency throughout the
                    year.
                  </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <div className="flex h-9 min-w-0 shrink-0 items-center rounded-none border !bg-card/90 !text-card-foreground shadow-sm backdrop-blur-sm hover:!bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none"
                      onClick={() => movePeriod(-1)}
                      aria-label={`Show previous ${rangeMonths} months`}
                    >
                      <ChevronLeft />
                    </Button>
                    <span className="min-w-0 whitespace-nowrap px-2 text-center text-[11px] font-medium tabular-nums sm:text-xs">
                      {periodFormatter.format(periodStart)} –{" "}
                      {periodFormatter.format(periodEnd)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none"
                      onClick={() => movePeriod(1)}
                      disabled={isCurrentPeriod}
                      aria-label={`Show next ${rangeMonths} months`}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          className="shrink-0 rounded-none !bg-card/90 !text-card-foreground shadow-sm backdrop-blur-sm hover:!bg-card"
                        />
                      }
                    >
                      <CalendarRange />
                      {rangeMonths === 12
                        ? "1 year"
                        : `${rangeMonths} months`}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-36">
                      {[3, 6, 12].map((months) => (
                        <DropdownMenuItem
                          key={months}
                          onClick={() => {
                            setRangeMonths(months);
                            setPeriodEnd(today);
                          }}
                          className="text-sm font-medium"
                        >
                          <CalendarRange />
                          {months === 12 ? "1 year" : `${months} months`}
                          {rangeMonths === months && (
                            <Check className="ml-auto" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
            <HeroStats
              stats={[
                { label: "Workouts", value: "0" },
                { label: "Personal records", value: "0" },
                { label: "Current streak", value: "0 days" },
              ]}
            />
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-4 auto-rows-[8rem] gap-3 sm:gap-4">
          <div className="col-span-4 min-w-0 row-span-2 sm:col-span-2">
            <ActivityWidget
              today={today}
              endDate={periodEnd}
              rangeMonths={rangeMonths}
              label="Activity history"
              sublabel="Select a day to view its workout details."
            />
          </div>

          <div className="col-span-4 min-w-0 row-span-2 sm:col-span-2">
            <TimelineWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

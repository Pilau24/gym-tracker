"use client";

import { useState } from "react";
import { ActivityGrid } from "@/components/profile-showcase/activity-widget";
import {
  Activity,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActivityPage() {
  const [rangeMonths, setRangeMonths] = useState(3);
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
                Review workouts, milestones, and consistency throughout the year.
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <div className="flex min-w-0 items-center rounded-none border bg-muted/30 p-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
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
                  size="icon-sm"
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
                      size="sm"
                      className="gap-1.5"
                    />
                  }
                >
                  <CalendarRange />
                  {rangeMonths === 12 ? "1 year" : `${rangeMonths} months`}
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

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Dumbbell}
            label="Workouts"
            value="0"
            detail={rangeMonths === 12 ? "This year" : `Last ${rangeMonths} months`}
          />
          <SummaryCard
            icon={Trophy}
            label="Personal records"
            value="0"
            detail={rangeMonths === 12 ? "This year" : `Last ${rangeMonths} months`}
          />
          <SummaryCard
            icon={CalendarDays}
            label="Current streak"
            value="0 days"
            detail="Keep showing up"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card className="min-w-0 gap-0 overflow-visible rounded-none py-0 shadow-sm">
            <CardHeader className="!pb-3 gap-2 rounded-none border-b px-3 py-3 sm:px-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-4" aria-hidden="true" />
                  Activity history
                </CardTitle>
                <CardDescription className="mt-1">
                  Select a day to view its workout details.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ActivityGrid
                today={today}
                endDate={periodEnd}
                rangeMonths={rangeMonths}
              />
            </CardContent>
          </Card>

          <Card className="rounded-none shadow-none">
            <CardHeader className="border-b">
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Your latest sessions appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
              <Dumbbell
                className="size-8 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="max-w-52 text-xs text-muted-foreground">
                Log your first workout to start building your history.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="gap-0 rounded-none py-0 shadow-none">
      <CardContent className="flex flex-row items-center gap-2 p-3">
        <span className="flex size-8 shrink-0 items-center justify-center border bg-muted">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

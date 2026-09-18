"use client";

import { memo } from "react";
import { ScanLine } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize } from "./widget-layout";

export type CoverageArea =
  | "back"
  | "shoulders"
  | "core"
  | "arms"
  | "legs"
  | "chest";

export type CoverageQueryRow = {
  month: string;
  totalMonthDaysPassed: number;
  coverage: Record<CoverageArea, number[]>;
};

const coverageAreas: Array<{ key: CoverageArea; label: string }> = [
  { key: "back", label: "Back" },
  { key: "shoulders", label: "Shoulders" },
  { key: "core", label: "Core" },
  { key: "arms", label: "Arms" },
  { key: "legs", label: "Legs" },
  { key: "chest", label: "Chest" },
];

function getCoverageChartConfig(
  currentMonth: string,
  previousMonth: string,
): ChartConfig {
  return {
    current: {
      label: currentMonth,
      color: "var(--chart-1)",
    },
    previous: {
      label: previousMonth,
      color: "var(--chart-2)",
    },
  };
}

function createCoverageDays(
  totalDays: number,
  coveredDays: number,
  seed: number,
) {
  const days = Array.from({ length: totalDays }, () => 0);
  const indices = Array.from({ length: totalDays }, (_, index) => index).sort(
    (left, right) =>
      ((left * 1103515245 + seed * 12345) % 2147483647) -
      ((right * 1103515245 + seed * 12345) % 2147483647),
  );

  for (const index of indices.slice(0, coveredDays)) days[index] = 1;
  return days;
}

export function getCoverageQueryRows(now: Date): CoverageQueryRow[] {
  const currentMonthDaysPassed = now.getDate();
  const previousMonthDays = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
  ).getDate();
  const previousCoverageDays = Math.floor(previousMonthDays * 0.8);
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

  return [
    {
      month: monthFormatter.format(now),
      totalMonthDaysPassed: currentMonthDaysPassed,
      coverage: {
        back: createCoverageDays(currentMonthDaysPassed, currentMonthDaysPassed, 1),
        shoulders: createCoverageDays(
          currentMonthDaysPassed,
          currentMonthDaysPassed,
          2,
        ),
        core: createCoverageDays(currentMonthDaysPassed, 3, 3),
        arms: createCoverageDays(currentMonthDaysPassed, currentMonthDaysPassed, 4),
        legs: createCoverageDays(currentMonthDaysPassed, 2, 5),
        chest: createCoverageDays(currentMonthDaysPassed, currentMonthDaysPassed, 6),
      },
    },
    {
      month: monthFormatter.format(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
      ),
      totalMonthDaysPassed: previousMonthDays,
      coverage: {
        back: createCoverageDays(previousMonthDays, previousCoverageDays, 7),
        shoulders: createCoverageDays(previousMonthDays, previousCoverageDays, 8),
        core: createCoverageDays(previousMonthDays, previousCoverageDays, 9),
        arms: createCoverageDays(previousMonthDays, 22, 10),
        legs: createCoverageDays(previousMonthDays, previousCoverageDays, 11),
        chest: createCoverageDays(previousMonthDays, previousCoverageDays, 12),
      },
    },
  ];
}

const CoverageChart = memo(function CoverageChart({
  rows,
}: {
  rows: readonly CoverageQueryRow[];
}) {
  const [currentMonth, previousMonth] = rows;
  const chartConfig = getCoverageChartConfig(
    currentMonth.month,
    previousMonth.month,
  );
  const getCoverageRate = (row: CoverageQueryRow, area: CoverageArea) =>
    row.coverage[area].reduce((total, covered) => total + covered, 0) /
    row.totalMonthDaysPassed;
  const chartData = coverageAreas.map(({ key, label }) => ({
    area: label,
    current: getCoverageRate(currentMonth, key),
    currentDays: currentMonth.coverage[key].reduce(
      (total, covered) => total + covered,
      0,
    ),
    currentTotalDays: currentMonth.totalMonthDaysPassed,
    previous: getCoverageRate(previousMonth, key),
    previousDays: previousMonth.coverage[key].reduce(
      (total, covered) => total + covered,
      0,
    ),
    previousTotalDays: previousMonth.totalMonthDaysPassed,
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[180px] max-w-[180px] w-full [&_.recharts-surface]:overflow-visible"
      onMouseDown={(event) => event.preventDefault()}
    >
      <RadarChart
        accessibilityLayer={false}
        data={chartData}
        aria-label={`Coverage comparison for ${currentMonth.month} and ${previousMonth.month}`}
      >
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              valueFormatter={(_value, item) => {
                const key = String(item.dataKey);
                const payload = item.payload as (typeof chartData)[number];
                const days =
                  key === "current"
                    ? payload.currentDays
                    : payload.previousDays;
                const totalDays =
                  key === "current"
                    ? payload.currentTotalDays
                    : payload.previousTotalDays;
                return `${days}/${totalDays}`;
              }}
            />
          }
        />
        <PolarAngleAxis
          dataKey="area"
          tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
          tickLine={false}
        />
        <PolarGrid />
        <PolarRadiusAxis
          domain={[0, 1]}
          allowDecimals
          axisLine={false}
          tick={{ fill: "transparent" }}
          tickLine={false}
          tickCount={5}
        />
        <Radar
          dataKey="previous"
          fill="var(--color-previous)"
          fillOpacity={0.2}
          isAnimationActive={false}
          stroke="var(--color-previous)"
          strokeWidth={2}
        />
        <Radar
          dataKey="current"
          fill="var(--color-current)"
          fillOpacity={0.35}
          isAnimationActive={false}
          stroke="var(--color-current)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
});

export const CoverageWidget = memo(function CoverageWidget({
  rows = getCoverageQueryRows(new Date()),
  allowedSizes,
}: {
  rows?: readonly CoverageQueryRow[];
  allowedSizes: readonly WidgetSize[];
}) {
  const [currentMonth, previousMonth] = rows;

  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      label="Coverage"
      icon={<ScanLine aria-hidden="true" />}
      sublabel={`Coverage for ${currentMonth.month} compared with ${previousMonth.month}.`}
      contentClassName="flex"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-none border border-dashed bg-muted/30 p-1">
        <CoverageChart rows={rows} />
      </div>
    </StandardWidget>
  );
});

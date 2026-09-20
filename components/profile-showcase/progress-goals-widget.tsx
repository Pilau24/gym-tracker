"use client";

import { memo } from "react";
import { Goal } from "lucide-react";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize, WidgetSizes } from "./widget-layout";

export type ProgressGoal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
};

const defaultGoals: readonly ProgressGoal[] = [
  { id: "workouts", label: "Workouts", current: 8, target: 12, unit: "sessions" },
  {
    id: "active-minutes",
    label: "Active minutes",
    current: 240,
    target: 300,
    unit: "minutes",
  },
  {
    id: "strength-sessions",
    label: "Strength sessions",
    current: 6,
    target: 8,
    unit: "sessions",
  },
  {
    id: "mobility-sessions",
    label: "Mobility sessions",
    current: 3,
    target: 6,
    unit: "sessions",
  },
];

export const ProgressGoalsWidget = memo(function ProgressGoalsWidget({
  goals = defaultGoals,
  settings,
  sizes,
  allowedSizes,
  editable,
}: {
  goals?: readonly ProgressGoal[];
  settings: Record<string, unknown>;
  sizes: WidgetSizes;
  allowedSizes: readonly WidgetSize[];
  editable?: boolean;
}) {
  const pinnedGoalIds = Array.isArray(settings.pinnedGoalIds)
    ? settings.pinnedGoalIds.filter(
        (value): value is string => typeof value === "string",
      )
    : null;
  const visibleGoals =
    pinnedGoalIds && pinnedGoalIds.length > 0
      ? goals.filter((goal) => pinnedGoalIds.includes(goal.id))
      : goals;

  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      sizes={sizes}
      label="Progress goals"
      icon={<Goal aria-hidden="true" />}
      sublabel="Track this month's targets."
      editable={editable}
      contentClassName="flex"
    >
      <div className="grid min-h-0 flex-1 grid-rows-4 gap-1 sm:gap-2">
        {visibleGoals.slice(0, 4).map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100),
          );

          return (
            <Progress
              key={goal.label}
              value={percentage}
              className="min-w-0 gap-0.5 text-[11px] sm:text-xs [&_[data-slot=progress-indicator]]:rounded-none [&_[data-slot=progress-track]]:h-2 sm:[&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:rounded-none"
              aria-label={`${goal.label}: ${goal.current} of ${goal.target} ${goal.unit}`}
            >
              <ProgressLabel className="min-w-0 truncate">
                {goal.label}
              </ProgressLabel>
              <ProgressValue>
                {() => `${goal.current}/${goal.target} ${goal.unit}`}
              </ProgressValue>
            </Progress>
          );
        })}
      </div>
    </StandardWidget>
  );
});

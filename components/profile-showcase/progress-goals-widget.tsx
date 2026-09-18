"use client";

import { memo } from "react";
import { Goal } from "lucide-react";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { StandardWidget } from "./standard-widget";
import type { WidgetSize } from "./widget-layout";

export type ProgressGoal = {
  label: string;
  current: number;
  target: number;
  unit: string;
};

const defaultGoals: readonly ProgressGoal[] = [
  { label: "Workouts", current: 8, target: 12, unit: "sessions" },
  { label: "Active minutes", current: 240, target: 300, unit: "minutes" },
  { label: "Strength sessions", current: 6, target: 8, unit: "sessions" },
  { label: "Mobility sessions", current: 3, target: 6, unit: "sessions" },
];

export const ProgressGoalsWidget = memo(function ProgressGoalsWidget({
  goals = defaultGoals,
  allowedSizes,
}: {
  goals?: readonly ProgressGoal[];
  allowedSizes: readonly WidgetSize[];
}) {
  return (
    <StandardWidget
      allowedSizes={allowedSizes}
      label="Progress goals"
      icon={<Goal aria-hidden="true" />}
      sublabel="Track this month's targets."
      contentClassName="flex"
    >
      <div className="grid min-h-0 flex-1 grid-rows-4 gap-2">
        {goals.slice(0, 4).map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100),
          );

          return (
            <Progress
              key={goal.label}
              value={percentage}
              className="min-w-0 gap-0.5 [&_[data-slot=progress-indicator]]:rounded-none [&_[data-slot=progress-track]]:h-4 [&_[data-slot=progress-track]]:rounded-none"
              aria-label={`${goal.label}: ${goal.current} of ${goal.target} ${goal.unit}`}
            >
              <ProgressLabel className="min-w-0 truncate text-xs">
                {goal.label}
              </ProgressLabel>
              <ProgressValue className="text-xs">
                {() => `${goal.current}/${goal.target} ${goal.unit}`}
              </ProgressValue>
            </Progress>
          );
        })}
      </div>
    </StandardWidget>
  );
});

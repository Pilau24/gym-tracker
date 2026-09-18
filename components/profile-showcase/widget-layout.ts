import type { ReactNode } from "react";

export type ShowcaseId =
  | "achievements"
  | "activity"
  | "coverage"
  | "progress-goals";

export type WidgetSize = "1x1" | "1x2" | "1x4" | "2x1" | "2x2" | "2x4";

export type WidgetState = {
  id: ShowcaseId;
  size: WidgetSize;
};

export type WidgetDefinition = {
  id: ShowcaseId;
  label: string;
  defaultSize: WidgetSize;
  allowedSizes: readonly WidgetSize[];
};

export type StandardWidgetProps = {
  allowedSizes: readonly WidgetSize[];
  label: ReactNode;
  icon: ReactNode;
  sublabel: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export const defaultWidgets: WidgetState[] = [
  { id: "achievements", size: "1x4" },
  { id: "activity", size: "2x4" },
  { id: "coverage", size: "2x1" },
  { id: "progress-goals", size: "2x1" },
];

export const widgetDefinitions: readonly WidgetDefinition[] = [
  {
    id: "achievements",
    label: "Achievement Showcase",
    defaultSize: "1x4",
    allowedSizes: ["1x2", "1x4"],
  },
  {
    id: "activity",
    label: "Recent Activity",
    defaultSize: "2x4",
    allowedSizes: ["2x2", "2x4"],
  },
  {
    id: "coverage",
    label: "Coverage",
    defaultSize: "2x1",
    allowedSizes: ["2x1"],
  },
  {
    id: "progress-goals",
    label: "Progress Goals",
    defaultSize: "2x1",
    allowedSizes: ["2x1"],
  },
];

export const widgetSizeClasses: Record<WidgetSize, string> = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-2 row-span-1",
  "1x4": "col-span-4 row-span-1",
  "2x1": "col-span-1 row-span-2",
  "2x2": "col-span-2 row-span-2",
  "2x4": "col-span-4 row-span-2",
};

export const widgetSizeDimensions: Record<
  WidgetSize,
  { width: number; height: number }
> = {
  "1x1": { width: 1, height: 1 },
  "1x2": { width: 2, height: 1 },
  "1x4": { width: 4, height: 1 },
  "2x1": { width: 1, height: 2 },
  "2x2": { width: 2, height: 2 },
  "2x4": { width: 4, height: 2 },
};

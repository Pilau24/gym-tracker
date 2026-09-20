import type { ReactNode } from "react";

export type ShowcaseId =
  | "achievements"
  | "activity"
  | "coverage"
  | "progress-goals";

export type WidgetSize = "1x1" | "1x2" | "1x4" | "2x1" | "2x2" | "2x4";

export type WidgetSizes = {
  sm: WidgetSize;
  md: WidgetSize;
  lg: WidgetSize;
};

export type WidgetSettings = Record<string, unknown>;

export type WidgetState = {
  id: string;
  sizes: WidgetSizes;
  settings: WidgetSettings;
};

export type WidgetDefinition = {
  id: ShowcaseId;
  label: string;
  defaultSizes: WidgetSizes;
  defaultSettings: WidgetSettings;
  allowedSizes: readonly WidgetSize[];
};

export type StandardWidgetProps = {
  sizes: WidgetSizes;
  allowedSizes: readonly WidgetSize[];
  label: ReactNode;
  icon: ReactNode;
  sublabel: ReactNode;
  children: ReactNode;
  editable?: boolean;
  className?: string;
  contentClassName?: string;
};

export const defaultWidgets: WidgetState[] = [
  {
    id: "achievements",
    sizes: { sm: "2x4", md: "2x2", lg: "2x2" },
    settings: {},
  },
  {
    id: "activity",
    sizes: { sm: "2x4", md: "2x2", lg: "2x2" },
    settings: {},
  },
  {
    id: "coverage",
    sizes: { sm: "2x4", md: "2x2", lg: "2x1" },
    settings: {},
  },
  {
    id: "progress-goals",
    sizes: { sm: "2x4", md: "2x2", lg: "2x2" },
    settings: {},
  },
];

export const widgetDefinitions: readonly WidgetDefinition[] = [
  {
    id: "achievements",
    label: "Achievement Showcase",
    defaultSizes: { sm: "2x4", md: "2x2", lg: "2x2" },
    defaultSettings: {},
    allowedSizes: ["2x2"],
  },
  {
    id: "activity",
    label: "Recent Activity",
    defaultSizes: { sm: "2x4", md: "2x2", lg: "2x2" },
    defaultSettings: {},
    allowedSizes: ["2x2"],
  },
  {
    id: "coverage",
    label: "Coverage",
    defaultSizes: { sm: "2x4", md: "2x2", lg: "2x1" },
    defaultSettings: {},
    allowedSizes: ["2x1", "2x2"],
  },
  {
    id: "progress-goals",
    label: "Progress Goals",
    defaultSizes: { sm: "2x4", md: "2x2", lg: "2x2" },
    defaultSettings: {},
    allowedSizes: ["2x2"],
  },
];

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

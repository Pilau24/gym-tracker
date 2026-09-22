import { prisma } from "@/lib/db";
import {
  defaultWidgets,
  widgetDefinitions,
  type ShowcaseId,
  type WidgetSettings,
  type WidgetSize,
  type WidgetSizes,
  type WidgetState,
} from "@/components/profile-showcase/widget-layout";

const widgetSizes: readonly WidgetSize[] = [
  "1x1",
  "1x2",
  "1x4",
  "2x1",
  "2x2",
  "2x4",
];

const fallbackSizes: WidgetSizes = {
  sm: "2x4",
  md: "2x2",
  lg: "2x2",
};

export type ProfileWidgetInput = {
  widgetType: string;
  sizes: WidgetSizes;
  settings: WidgetSettings;
};

const legacyWidgetTypeAliases: Record<string, ShowcaseId> = {
  "recent-activity": "timeline",
};

export function normalizeWidgetType(widgetType: string) {
  return legacyWidgetTypeAliases[widgetType] ?? widgetType;
}

export function isKnownWidgetType(widgetType: string): widgetType is ShowcaseId {
  return widgetDefinitions.some((definition) => definition.id === widgetType);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWidgetSize(value: unknown): value is WidgetSize {
  return typeof value === "string" && widgetSizes.includes(value as WidgetSize);
}

export function isWidgetSizes(value: unknown): value is WidgetSizes {
  if (!isRecord(value)) return false;
  return isWidgetSize(value.sm) && isWidgetSize(value.md) && isWidgetSize(value.lg);
}

export function isWidgetSettings(value: unknown): value is WidgetSettings {
  return isRecord(value);
}

function getDefaultSizes(widgetType: string) {
  return (
    widgetDefinitions.find((definition) => definition.id === widgetType)
      ?.defaultSizes ?? fallbackSizes
  );
}

function parseConfiguration(widgetType: string, rawConfiguration: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawConfiguration);
  } catch (error) {
    throw new Error(
      `Invalid configuration for profile widget "${widgetType}".`,
      { cause: error },
    );
  }

  if (!isRecord(parsed)) {
    throw new Error(
      `Profile widget "${widgetType}" configuration must be an object.`,
    );
  }

  return {
    sizes: isWidgetSizes(parsed.sizes)
      ? parsed.sizes
      : getDefaultSizes(widgetType),
    settings: isWidgetSettings(parsed.settings) ? parsed.settings : {},
  };
}

export function getDefaultWidgetStates() {
  return defaultWidgets.map((widget) => ({
    ...widget,
    sizes: { ...widget.sizes },
    settings: { ...widget.settings },
  }));
}

export async function loadProfileWidgets(userId: number): Promise<WidgetState[]> {
  const savedWidgets = await prisma.profileWidget.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: {
      widgetType: true,
      configuration: true,
    },
  });

  if (savedWidgets.length === 0) return getDefaultWidgetStates();

  const legacyWidgetTypes = new Set(Object.keys(legacyWidgetTypeAliases));
  const removedWidgetTypes = savedWidgets
    .map((widget) => widget.widgetType)
    .filter(
      (widgetType) =>
        !isKnownWidgetType(widgetType) && !legacyWidgetTypes.has(widgetType),
    );

  if (removedWidgetTypes.length > 0) {
    await prisma.profileWidget.deleteMany({
      where: {
        userId,
        widgetType: { in: removedWidgetTypes },
      },
    });
  }

  return savedWidgets.map((widget) => {
    const widgetType = normalizeWidgetType(widget.widgetType);
    const configuration = parseConfiguration(
      widgetType,
      widget.configuration,
    );
    return {
      id: widgetType,
      sizes: configuration.sizes,
      settings: configuration.settings,
    };
  }).filter((widget) => isKnownWidgetType(widget.id));
}

export async function replaceProfileWidgets(
  userId: number,
  widgets: readonly ProfileWidgetInput[],
) {
  await prisma.$transaction([
    prisma.profileWidget.deleteMany({ where: { userId } }),
    prisma.profileWidget.createMany({
      data: widgets.map((widget, position) => ({
        userId,
        widgetType: widget.widgetType,
        position,
        configuration: JSON.stringify({
          sizes: widget.sizes,
          settings: widget.settings,
        }),
      })),
    }),
  ]);
}

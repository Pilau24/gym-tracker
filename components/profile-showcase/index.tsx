"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AchievementsWidget } from "./achievements-widget";
import type { AchievementItem } from "./achievements-widget";
import { ActivityWidget } from "./activity-widget";
import { CoverageWidget, getCoverageQueryRows } from "./coverage-widget";
import { ProgressGoalsWidget } from "./progress-goals-widget";
import { TimelineWidget } from "./timeline-widget";
import {
  defaultWidgets,
  widgetDefinitions,
  widgetSizeDimensions,
  type ShowcaseId,
  type WidgetSizes,
  type WidgetState,
} from "./widget-layout";

const achievementItems: readonly AchievementItem[] = [
  { id: "featured", label: "Featured" },
  { id: "milestones", label: "Milestones" },
  { id: "perfect-runs", label: "Perfect runs" },
  { id: "collections", label: "Collections" },
];

const coverageRows = getCoverageQueryRows(new Date());

function getWidgetDefinition(id: string) {
  return widgetDefinitions.find((definition) => definition.id === id);
}

function renderWidget(
  id: string,
  sizes: WidgetSizes,
  settings: Record<string, unknown>,
  editable: boolean,
) {
  const definition = getWidgetDefinition(id);
  if (!definition) return null;

  if (id === "achievements") {
    return (
      <AchievementsWidget
        items={achievementItems}
        settings={settings}
        sizes={sizes}
        allowedSizes={definition.allowedSizes}
        editable={editable}
      />
    );
  }

  if (id === "activity") {
    return (
      <ActivityWidget
        allowedSizes={definition.allowedSizes}
        sizes={sizes}
        editable={editable}
      />
    );
  }

  if (id === "timeline") {
    return (
      <TimelineWidget
        allowedSizes={definition.allowedSizes}
        sizes={sizes}
        editable={editable}
      />
    );
  }

  if (id === "coverage") {
    return (
      <CoverageWidget
        rows={coverageRows}
        sizes={sizes}
        allowedSizes={definition.allowedSizes}
        editable={editable}
      />
    );
  }

  return (
    <ProgressGoalsWidget
      sizes={sizes}
      settings={settings}
      allowedSizes={definition.allowedSizes}
      editable={editable}
    />
  );
}

function WidgetFrame({
  widget,
  editable,
  onRemove,
  children,
}: {
  widget: WidgetState;
  editable: boolean;
  onRemove: (id: string) => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !editable,
  });

  const label = getWidgetDefinition(widget.id)?.label ?? widget.id;
  const smDimensions = widgetSizeDimensions[widget.sizes.sm];
  const mdDimensions = widgetSizeDimensions[widget.sizes.md];
  const lgDimensions = widgetSizeDimensions[widget.sizes.lg];
  const gridStyle: CSSProperties & {
    "--widget-sm-columns": number;
    "--widget-sm-rows": number;
    "--widget-md-columns": number;
    "--widget-md-rows": number;
    "--widget-lg-columns": number;
    "--widget-lg-rows": number;
  } = {
    "--widget-sm-columns": smDimensions.width,
    "--widget-sm-rows": smDimensions.height,
    "--widget-md-columns": mdDimensions.width,
    "--widget-md-rows": mdDimensions.height,
    "--widget-lg-columns": lgDimensions.width,
    "--widget-lg-rows": lgDimensions.height,
    transform: CSS.Transform.toString(transform) ?? undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-widget-id={widget.id}
      data-widget-size-sm={widget.sizes.sm}
      data-widget-size-md={widget.sizes.md}
      data-widget-size-lg={widget.sizes.lg}
      className={cn(
        "relative min-w-0 select-none [grid-column:span_var(--widget-sm-columns)] [grid-row:span_var(--widget-sm-rows)]",
        "md:[grid-column:span_var(--widget-md-columns)] md:[grid-row:span_var(--widget-md-rows)]",
        "lg:[grid-column:span_var(--widget-lg-columns)] lg:[grid-row:span_var(--widget-lg-rows)]",
        editable && "max-sm:[grid-row:span_1]",
        editable && "group/widget touch-none cursor-grab",
        isDragging && "z-50",
      )}
      style={gridStyle}
    >
      {children}
      {editable && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-0 top-0 z-20 h-14 w-10 rounded-none border-0 border-l border-border/70 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-destructive sm:h-16 [&_svg]:size-4"
            onClick={() => onRemove(widget.id)}
            aria-label={`Remove ${label}`}
          >
            <X />
          </Button>
        </>
      )}
    </div>
  );
}

export function ProfileShowcase({
  editable = false,
  initialWidgets = defaultWidgets,
}: {
  editable?: boolean;
  initialWidgets?: readonly WidgetState[];
}) {
  const [widgets, setWidgets] = useState<WidgetState[]>(() =>
    initialWidgets.map((widget) => ({
      ...widget,
      sizes: { ...widget.sizes },
      settings: { ...widget.settings },
    })),
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const lastSavedWidgets = useRef(JSON.stringify(initialWidgets));
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setWidgets((current) => {
      const oldIndex = current.findIndex((widget) => widget.id === active.id);
      const newIndex = current.findIndex((widget) => widget.id === over.id);
      const next =
        oldIndex < 0 || newIndex < 0
          ? current
          : arrayMove(current, oldIndex, newIndex);
      return next;
    });
  }

  const saveWidgets = useCallback((nextWidgets: readonly WidgetState[]) => {
    setSaveError(null);
    void fetch("/api/profile/widgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widgets: nextWidgets.map(({ id, sizes, settings }) => ({
          widgetType: id,
          sizes,
          settings,
        })),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json()) as { error?: unknown };
          throw new Error(
            typeof body.error === "string"
              ? body.error
              : "Unable to save widget layout.",
          );
        }
      })
      .catch((error: unknown) => {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Unable to save widget layout.",
        );
      });
  }, []);

  useEffect(() => {
    if (!editable) return;
    const serializedWidgets = JSON.stringify(widgets);
    if (serializedWidgets === lastSavedWidgets.current) return;
    lastSavedWidgets.current = serializedWidgets;
    saveWidgets(widgets);
  }, [editable, saveWidgets, widgets]);

  function removeWidget(id: string) {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
  }

  function addWidget(id: ShowcaseId) {
    const definition = getWidgetDefinition(id);
    if (!definition) return;
    setWidgets((current) => [
      ...current,
      {
        id,
        sizes: definition.defaultSizes,
        settings: definition.defaultSettings,
      },
    ]);
  }

  const availableWidgets = widgetDefinitions.filter(
    (definition) => !widgets.some((widget) => widget.id === definition.id),
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {saveError && (
        <p className="border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
          {saveError}
        </p>
      )}
      <DndContext
        id="profile-showcase"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((widget) => widget.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={cn(
              "grid min-w-0 grid-cols-4 auto-rows-[8rem] gap-3 sm:gap-4",
              editable && "max-md:auto-rows-[auto]",
            )}
          >
            {widgets.map((widget) => (
              <WidgetFrame
                key={widget.id}
                widget={widget}
                editable={editable}
                onRemove={removeWidget}
              >
                {renderWidget(
                  widget.id,
                  widget.sizes,
                  widget.settings,
                  editable,
                )}
              </WidgetFrame>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {editable && availableWidgets.length > 0 && (
        <section className="border border-dashed bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Add widgets</h2>
              <p className="text-xs text-muted-foreground">
                Add a widget back to your profile layout.
              </p>
            </div>
            <Plus className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableWidgets.map((widget) => (
              <Button
                key={widget.id}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => addWidget(widget.id)}
              >
                <Plus data-icon="inline-start" />
                {widget.label}
              </Button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

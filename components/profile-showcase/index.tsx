"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent, PointerEvent } from "react";
import { Grip, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AchievementsWidget } from "./achievements-widget";
import type { AchievementItem } from "./achievements-widget";
import { ActivityWidget } from "./activity-widget";
import { CoverageWidget, getCoverageQueryRows } from "./coverage-widget";
import { ProgressGoalsWidget } from "./progress-goals-widget";
import {
  defaultWidgets,
  widgetDefinitions,
  widgetSizeClasses,
  widgetSizeDimensions,
  type ShowcaseId,
  type WidgetSize,
  type WidgetState,
} from "./widget-layout";

const achievementItems: readonly AchievementItem[] = [
  { label: "Featured" },
  { label: "Milestones" },
  { label: "Perfect runs" },
  { label: "Collections" },
];

const coverageRows = getCoverageQueryRows(new Date());

function getResizedWidgetSize(
  size: WidgetSize,
  deltaX: number,
  deltaY: number,
  allowedSizes: readonly WidgetSize[],
): WidgetSize {
  const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);
  const currentDimensions = widgetSizeDimensions[size];
  const dimension = horizontal ? "width" : "height";
  const delta = horizontal ? deltaX : deltaY;

  if (Math.abs(delta) <= 24) return size;

  const candidates = allowedSizes
    .filter((candidate) => {
      const candidateDimension = widgetSizeDimensions[candidate][dimension];
      return delta > 0
        ? candidateDimension > currentDimensions[dimension]
        : candidateDimension < currentDimensions[dimension];
    })
    .sort((left, right) => {
      const leftDimension = widgetSizeDimensions[left][dimension];
      const rightDimension = widgetSizeDimensions[right][dimension];
      return delta > 0
        ? leftDimension - rightDimension
        : rightDimension - leftDimension;
    });

  return candidates[0] ?? size;
}

function getWidgetDefinition(id: ShowcaseId) {
  return widgetDefinitions.find((definition) => definition.id === id);
}

function renderWidget(id: ShowcaseId) {
  const definition = getWidgetDefinition(id);
  if (!definition) return null;

  if (id === "achievements") {
    return (
      <AchievementsWidget
        items={achievementItems}
        allowedSizes={definition.allowedSizes}
      />
    );
  }

  if (id === "activity") {
    return <ActivityWidget allowedSizes={definition.allowedSizes} />;
  }

  if (id === "coverage") {
    return (
      <CoverageWidget
        rows={coverageRows}
        allowedSizes={definition.allowedSizes}
      />
    );
  }

  return <ProgressGoalsWidget allowedSizes={definition.allowedSizes} />;
}

function WidgetFrame({
  widget,
  allowedSizes,
  displaySize,
  editable,
  isDragged,
  isResizing,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onResizePreview,
  onResizeEnd,
  onResizeCancel,
  children,
}: {
  widget: WidgetState;
  allowedSizes: readonly WidgetSize[];
  displaySize: WidgetSize;
  editable: boolean;
  isDragged: boolean;
  isResizing: boolean;
  onDragStart: (id: ShowcaseId) => void;
  onDragOver: (id: ShowcaseId, event: DragEvent<HTMLDivElement>) => void;
  onDrop: (id: ShowcaseId) => void;
  onDragEnd: () => void;
  onRemove: (id: ShowcaseId) => void;
  onResizePreview: (id: ShowcaseId, size: WidgetSize) => void;
  onResizeEnd: (id: ShowcaseId, size: WidgetSize) => void;
  onResizeCancel: () => void;
  children: React.ReactNode;
}) {
  const isResizable = allowedSizes.length > 1;
  const resizeStart = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  function handleResizeStart(event: PointerEvent<HTMLButtonElement>) {
    if (!isResizable) return;
    event.preventDefault();
    event.stopPropagation();
    resizeStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event: PointerEvent<HTMLButtonElement>) {
    const start = resizeStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    onResizePreview(
      widget.id,
      getResizedWidgetSize(
        widget.size,
        event.clientX - start.x,
        event.clientY - start.y,
        allowedSizes,
      ),
    );
  }

  function handleResizeEnd(event: PointerEvent<HTMLButtonElement>) {
    if (resizeStart.current?.pointerId !== event.pointerId) return;
    onResizeEnd(
      widget.id,
      getResizedWidgetSize(
        widget.size,
        event.clientX - resizeStart.current.x,
        event.clientY - resizeStart.current.y,
        allowedSizes,
      ),
    );
    resizeStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleResizeCancel(event: PointerEvent<HTMLButtonElement>) {
    if (resizeStart.current?.pointerId !== event.pointerId) return;
    resizeStart.current = null;
    onResizeCancel();
  }

  const label = getWidgetDefinition(widget.id)?.label ?? widget.id;

  return (
    <div
      data-widget-id={widget.id}
      data-widget-size={displaySize}
      draggable={editable}
      onDragStart={() => editable && onDragStart(widget.id)}
      onDragOver={
        editable ? (event) => onDragOver(widget.id, event) : undefined
      }
      onDrop={() => editable && onDrop(widget.id)}
      onDragEnd={editable ? onDragEnd : undefined}
      className={cn(
        "relative min-w-0 transition-opacity duration-150",
        widgetSizeClasses[displaySize],
        editable && "group/widget cursor-grab active:cursor-grabbing",
        isDragged && "opacity-40",
        isResizing && "opacity-40 outline-2 outline-dashed outline-primary/60",
      )}
    >
      {children}
      {editable && (
        <>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute -right-2 -top-2 z-20 rounded-none"
            onClick={() => onRemove(widget.id)}
            aria-label={`Remove ${label}`}
          >
            <Minus />
          </Button>
          <button
            type="button"
            disabled={!isResizable}
            className={cn(
              "absolute -bottom-1 -right-1 z-20 flex size-6 items-end justify-end bg-primary p-0.5 text-primary-foreground opacity-70 transition-opacity focus-visible:opacity-100",
              isResizable
                ? "cursor-se-resize hover:opacity-100"
                : "cursor-not-allowed opacity-30",
            )}
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeCancel}
            aria-label={
              isResizable
                ? `Resize ${label} (${widget.size})`
                : `${label} cannot be resized`
            }
          >
            <Grip className="size-3" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

export function ProfileShowcase({ editable = false }: { editable?: boolean }) {
  const [widgets, setWidgets] = useState<WidgetState[]>(defaultWidgets);
  const [draggedId, setDraggedId] = useState<ShowcaseId | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    id: ShowcaseId;
    size: WidgetSize;
  } | null>(null);
  const renderedWidgets = useMemo(
    () => ({
      achievements: renderWidget("achievements"),
      activity: renderWidget("activity"),
      coverage: renderWidget("coverage"),
      "progress-goals": renderWidget("progress-goals"),
    }),
    [],
  );

  function previewWidgetPosition(
    targetId: ShowcaseId,
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const targetBounds = event.currentTarget.getBoundingClientRect();
    const sourceIndex = widgets.findIndex((widget) => widget.id === draggedId);
    const targetIndex = widgets.findIndex((widget) => widget.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const movingForward = sourceIndex < targetIndex;
    const deadband = 24;
    const crossedTarget = movingForward
      ? event.clientY > targetBounds.top + targetBounds.height / 2 + deadband
      : event.clientY < targetBounds.bottom - targetBounds.height / 2 - deadband;
    if (!crossedTarget) return;

    setWidgets((current) => {
      const sourceIndex = current.findIndex((widget) => widget.id === draggedId);
      const targetIndex = current.findIndex((widget) => widget.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  function removeWidget(id: ShowcaseId) {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
  }

  function addWidget(id: ShowcaseId) {
    const definition = getWidgetDefinition(id);
    if (!definition) return;
    setWidgets((current) => [
      ...current,
      { id, size: definition.defaultSize },
    ]);
  }

  function previewWidgetResize(id: ShowcaseId, size: WidgetSize) {
    const definition = getWidgetDefinition(id);
    if (!definition || !definition.allowedSizes.includes(size)) return;
    setResizePreview({ id, size });
  }

  function commitWidgetResize(id: ShowcaseId, size: WidgetSize) {
    const definition = getWidgetDefinition(id);
    if (!definition || !definition.allowedSizes.includes(size)) {
      setResizePreview(null);
      return;
    }
    setWidgets((current) =>
      current.map((widget) => (widget.id === id ? { ...widget, size } : widget)),
    );
    setResizePreview(null);
  }

  const availableWidgets = widgetDefinitions.filter(
    (definition) => !widgets.some((widget) => widget.id === definition.id),
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid min-w-0 grid-cols-2 auto-rows-[clamp(8rem,12vw,9rem)] gap-4 sm:grid-cols-4">
        {widgets.map((widget) => (
          <WidgetFrame
            key={widget.id}
            widget={widget}
            allowedSizes={getWidgetDefinition(widget.id)?.allowedSizes ?? []}
            displaySize={
              resizePreview?.id === widget.id ? resizePreview.size : widget.size
            }
            editable={editable}
            isDragged={draggedId === widget.id}
            isResizing={resizePreview?.id === widget.id}
            onDragStart={setDraggedId}
            onDragOver={previewWidgetPosition}
            onDrop={() => setDraggedId(null)}
            onDragEnd={() => setDraggedId(null)}
            onRemove={removeWidget}
            onResizePreview={previewWidgetResize}
            onResizeEnd={commitWidgetResize}
            onResizeCancel={() => setResizePreview(null)}
          >
            {renderedWidgets[widget.id]}
          </WidgetFrame>
        ))}
      </div>
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

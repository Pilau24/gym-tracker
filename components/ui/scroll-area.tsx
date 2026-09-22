"use client"

import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "cn"

const PULL_REFRESH_THRESHOLD = 112
const MAX_PULL_DISTANCE = 144

function ScrollArea({
  className,
  children,
  pullToRefresh = false,
  ...props
}: ScrollAreaPrimitive.Root.Props & { pullToRefresh?: boolean }) {
  const router = useRouter()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const touchStartY = React.useRef<number | null>(null)
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (!pullToRefresh || isRefreshing || event.touches.length !== 1) return

    const viewport = event.currentTarget
    const target = event.target as Element
    const closestScrollArea = target.closest('[data-slot="scroll-area"]')
    if (
      viewport.scrollTop > 0 ||
      (closestScrollArea && closestScrollArea !== rootRef.current)
    ) {
      touchStartY.current = null
      return
    }

    touchStartY.current = event.touches[0].clientY
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (
      touchStartY.current === null ||
      isRefreshing ||
      event.touches.length !== 1
    ) {
      return
    }

    const distance = event.touches[0].clientY - touchStartY.current
    if (distance <= 0) {
      setPullDistance(0)
      return
    }

    setPullDistance(Math.min(distance * 0.55, MAX_PULL_DISTANCE))
  }

  function handleTouchEnd() {
    if (touchStartY.current === null) return

    const shouldRefresh = pullDistance >= PULL_REFRESH_THRESHOLD
    touchStartY.current = null
    setPullDistance(0)

    if (!shouldRefresh || isRefreshing) return

    setIsRefreshing(true)
    router.refresh()
    resetTimer.current = setTimeout(() => setIsRefreshing(false), 800)
  }

  return (
    <ScrollAreaPrimitive.Root
      ref={rootRef}
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] [scrollbar-gutter:stable] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
        onTouchStart={pullToRefresh ? handleTouchStart : undefined}
        onTouchMove={pullToRefresh ? handleTouchMove : undefined}
        onTouchEnd={pullToRefresh ? handleTouchEnd : undefined}
        onTouchCancel={pullToRefresh ? handleTouchEnd : undefined}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {pullToRefresh && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-2 z-10 flex size-7 items-center justify-center rounded-full border bg-background/95 text-muted-foreground opacity-0 shadow-sm transition-[opacity,transform] duration-150",
            pullDistance > 0 && "opacity-100",
            isRefreshing && "opacity-100",
          )}
          style={{
            left: "50%",
            transform: `translate(-50%, ${Math.min(
              pullDistance,
              40,
            )}px)`,
          }}
        >
          <LoaderCircle
            className={cn("size-3.5", isRefreshing && "animate-spin")}
          />
        </div>
      )}
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "!static flex touch-none select-none rounded-full bg-[var(--scrollbar-track)] opacity-0 transition-opacity data-[hovering]:opacity-[var(--scrollbar-visible-opacity)] data-[scrolling]:opacity-[var(--scrollbar-visible-opacity)] data-horizontal:h-[var(--scrollbar-horizontal-height)] data-horizontal:flex-col data-horizontal:px-px data-horizontal:py-px data-vertical:h-full data-vertical:w-[var(--scrollbar-vertical-width)] data-vertical:py-px hover:opacity-100",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-[var(--scrollbar-thumb)] transition-colors hover:bg-[var(--scrollbar-thumb-hover)] data-vertical:my-2 data-vertical:w-1 data-vertical:flex-none"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }

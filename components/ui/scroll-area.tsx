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
  const scrollbarTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showScrollbars, setShowScrollbars] = React.useState(false)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleViewportScroll = () => {
      setShowScrollbars(true)
      if (scrollbarTimer.current) clearTimeout(scrollbarTimer.current)
      scrollbarTimer.current = setTimeout(() => setShowScrollbars(false), 700)
    }

    viewport.addEventListener("scroll", handleViewportScroll, { passive: true })
    return () => {
      viewport.removeEventListener("scroll", handleViewportScroll)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      if (scrollbarTimer.current) clearTimeout(scrollbarTimer.current)
    }
  }, [])

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
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
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
      <ScrollBar visible={showScrollbars} />
      <ScrollBar orientation="horizontal" visible={showScrollbars} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  visible = false,
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props & { visible?: boolean }) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none rounded-full bg-transparent opacity-0 transition-opacity data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:px-px data-vertical:h-full data-vertical:w-2 data-vertical:py-px",
        visible && "opacity-60",
        "hover:opacity-100",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/50 transition-colors hover:bg-foreground/75"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }

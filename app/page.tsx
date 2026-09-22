import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { NextSessionWidget } from "@/components/profile-showcase/next-session-widget";
import { TimelineWidget } from "@/components/profile-showcase/timeline-widget";
import { HeroStats } from "@/components/hero-stats";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-full bg-muted/30 px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="relative">
          <div className="relative z-10 flex flex-col gap-3 pb-5 pt-4">
            <header>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dashboard reference
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Your training overview
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A compact reference for the shared hero, stats, controls,
                    and widget styles.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="shrink-0 rounded-none !bg-card/90 !text-card-foreground shadow-sm backdrop-blur-sm hover:!bg-card"
                  render={<Link href="/activity" />}
                  nativeButton={false}
                >
                  <CalendarRange data-icon="inline-start" />
                  View activity
                </Button>
              </div>
            </header>
            <HeroStats
              stats={[
                { label: "Workouts", value: "0" },
                { label: "Personal records", value: "0" },
                { label: "Current streak", value: "0 days" },
              ]}
            />
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-4 auto-rows-[8rem] gap-3 sm:gap-4">
          <div className="col-span-4 min-w-0 row-span-2 sm:col-span-2">
            <TimelineWidget items={[]} />
          </div>

          <div className="col-span-4 min-w-0 row-span-2 sm:col-span-2">
            <NextSessionWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

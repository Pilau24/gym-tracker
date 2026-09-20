import { ActivityGrid } from "@/components/profile-showcase/activity-widget";

export default function ActivityPage() {
  return (
    <div className="min-h-full bg-muted/30 px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">
            Review your activity throughout the year.
          </p>
        </div>
        <section className="h-72 border bg-card p-4">
          <ActivityGrid />
        </section>
      </div>
    </div>
  );
}

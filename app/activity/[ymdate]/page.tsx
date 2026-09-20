import Link from "next/link";
import { notFound } from "next/navigation";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export default async function ActivityDatePage({
  params,
}: PageProps<"/activity/[ymdate]">) {
  const { ymdate } = await params;
  if (!isValidDate(ymdate)) notFound();

  return (
    <div className="min-h-full bg-muted/30 px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div>
          <Link
            href="/activity"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to activity
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            Activity for {ymdate}
          </h1>
        </div>
        <section className="border bg-card p-4 text-sm text-muted-foreground">
          No activity details recorded for this date yet.
        </section>
      </div>
    </div>
  );
}

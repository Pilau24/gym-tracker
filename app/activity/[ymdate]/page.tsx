import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <Link
            href="/activity"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to activity
          </Link>
          <p className="mt-5 text-sm font-medium text-muted-foreground">
            Daily activity
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{ymdate}</h1>
        </div>
        <Card className="rounded-none shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden="true" />
              No activity recorded
            </CardTitle>
            <CardDescription>
              Workout details for this date will appear here after you log a
              session.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
            <Dumbbell
              className="size-8 text-muted-foreground/50"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Nothing to review yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

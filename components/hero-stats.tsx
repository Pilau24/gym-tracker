import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeroStat = {
  label: ReactNode;
  value: ReactNode;
};

export function HeroStats({
  stats,
  className,
}: {
  stats: readonly HeroStat[];
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-3 divide-x border bg-card py-3", className)}
    >
      {stats.map((stat, index) => (
        <div className="flex flex-col gap-1 px-3" key={index}>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
          <span className="text-sm font-medium">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}

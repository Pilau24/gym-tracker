"use client";

import {
  Check,
  Moon,
  Monitor,
  MoreHorizontal,
  Sun,
} from "lucide-react";

import { useTheme, type ThemeMode } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  icon: typeof Sun;
}> = [
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "light", label: "Light", icon: Sun },
  { mode: "auto", label: "Auto", icon: Monitor },
];

export function ThemeMenu({ inSettings = false }: { inSettings?: boolean }) {
  const { mode, theme, setMode } = useTheme();
  const CurrentIcon = mode === "auto" ? Monitor : theme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          inSettings ? (
            <Button variant="outline" className="min-w-28 justify-between" />
          ) : (
            <SidebarMenuButton className="text-sm font-medium text-sidebar-foreground" />
          )
        }
      >
        <CurrentIcon aria-hidden="true" />
        <span>Theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="min-w-40">
        {themeOptions.map(({ mode: optionMode, label, icon: Icon }) => (
          <DropdownMenuItem
            key={optionMode}
            onClick={() => setMode(optionMode)}
            className="text-sm font-medium"
          >
            <Icon />
            {label}
            {mode === optionMode && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem disabled className="text-sm font-medium">
          <MoreHorizontal />
          More (coming soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

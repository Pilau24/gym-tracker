"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Dumbbell,
  House,
  LogIn,
  LogOut,
  Trophy,
  Settings,
  UserPlus,
  UserRound,
  Utensils,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type SiteMenuProps = {
  isAuthenticated: boolean;
  username?: string;
  profileImageFilename?: string | null;
};

const navigationItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/meals", label: "Nutrition", icon: Utensils },
  { href: "/workouts", label: "Training", icon: Dumbbell },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
];

export function SiteMenu({
  isAuthenticated,
  username,
  profileImageFilename,
}: SiteMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (!response.ok) {
      throw new Error("Unable to log out.");
    }

    router.push("/");
  }

  const profileImageUrl = profileImageFilename
    ? `/uploads/${profileImageFilename}`
    : undefined;

  return (
    <>
      <Sidebar collapsible="icon" className="hidden md:flex">
        <SidebarHeader className="h-14 justify-center p-1">
        {isAuthenticated && username ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="h-auto min-h-12 bg-sidebar-accent/40 p-2 text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:mx-auto! group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
                    />
                  }
                >
                  <Avatar size="lg" className="after:hidden">
                    {profileImageUrl && (
                      <AvatarImage src={profileImageUrl} alt="" />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserRound className="size-6" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col text-left group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium capitalize">
                      {username}
                    </span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="min-w-48 [&_svg]:size-5"
                >
                  <DropdownMenuItem
                    className="text-sm font-medium text-popover-foreground"
                    render={<Link href="/achievements" />}
                  >
                    <Trophy />
                    Records
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-sm font-medium text-popover-foreground"
                    disabled
                  >
                    <Users />
                    Friends (coming soon)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-sm font-medium text-popover-foreground"
                    render={<Link href="/user/settings" />}
                  >
                    <Settings />
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-sm font-medium text-destructive"
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarGroupLabel className="text-base">Menu</SidebarGroupLabel>
        )}
        </SidebarHeader>

        <SidebarContent className="gap-0">
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      className="text-sm font-medium text-sidebar-foreground"
                      render={<Link href={item.href} />}
                    >
                      <Icon className="size-6 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {!isAuthenticated && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="text-sm font-medium text-sidebar-foreground"
                      render={<Link href="/login" />}
                    >
                      <LogIn className="size-6 shrink-0" aria-hidden="true" />
                      <span>Log in</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="text-sm font-medium text-sidebar-foreground"
                      render={<Link href="/register" />}
                    >
                      <UserPlus
                        className="size-6 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Register</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 flex min-h-20 items-center gap-1 border-t border-border/40 bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_3px_rgb(0_0_0/0.03)] backdrop-blur-md md:hidden"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-6 shrink-0" aria-hidden="true" />
            </Link>
          );
        })}
        {isAuthenticated && username ? (
          <Link
            href="/user/settings"
            aria-label="Open profile settings"
            className={`flex h-14 min-w-0 flex-1 items-center justify-center rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              pathname.startsWith("/user")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
              <Avatar size="sm" className="after:hidden">
                {profileImageUrl && (
                  <AvatarImage src={profileImageUrl} alt="" />
                )}
                <AvatarFallback className="bg-transparent text-muted-foreground">
                  <UserRound className="size-6" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogIn className="size-6" aria-hidden="true" />
            </Link>
            <Link
              href="/register"
              className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UserPlus className="size-6" aria-hidden="true" />
            </Link>
          </>
        )}
      </nav>
    </>
  );
}

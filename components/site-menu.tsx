"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
    <Sidebar collapsible="icon">
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
                    <AvatarFallback>
                      <UserRound className="size-1/2" aria-hidden="true" />
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
                      className="text-sm font-medium text-sidebar-foreground"
                      render={<Link href={item.href} />}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
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
                      <LogIn className="size-5 shrink-0" aria-hidden="true" />
                      <span>Log in</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="text-sm font-medium text-sidebar-foreground"
                      render={<Link href="/register" />}
                    >
                      <UserPlus
                        className="size-5 shrink-0"
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
  );
}

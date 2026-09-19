import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SiteMenu } from "@/components/site-menu";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    username: string;
    profileImageFilename: string | null;
  } | null;
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="fixed inset-0 h-auto min-h-0"
    >
      <SiteMenu
        isAuthenticated={Boolean(user)}
        username={user?.username}
        profileImageFilename={user?.profileImageFilename}
      />
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 border-b bg-background">
          <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden rounded-none md:inline-flex" />
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Your App
              </Link>
            </div>

            {user ? (
              <Button
                variant="ghost"
                size="icon"
                render={<Link href="/account" />}
                nativeButton={false}
                className="rounded-none"
                aria-label="Open settings"
              >
                <Settings />
              </Button>
            ) : (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      render={<Link href="/login" />}
                      className={navigationMenuTriggerStyle()}
                    >
                      Log in
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      render={<Link href="/register" />}
                      className={navigationMenuTriggerStyle()}
                    >
                      Register
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

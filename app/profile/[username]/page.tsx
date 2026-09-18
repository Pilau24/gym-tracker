import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { ProfileHero } from "@/components/profile-hero";
import { ProfileShowcase } from "@/components/profile-showcase";
import { SiteMenu } from "@/components/site-menu";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);
  const profile = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          username: true,
          profileImageFilename: true,
          bannerImageFilename: true,
        },
      })
    : null;

  if (!profile || profile.username !== username) {
    notFound();
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <SiteMenu
        isAuthenticated
        username={profile.username}
        profileImageFilename={profile.profileImageFilename}
      />
      <SidebarInset>
        <div className="min-h-screen bg-muted/30 text-foreground">
          <header className="h-14 border-b bg-background">
            <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hidden rounded-none md:inline-flex" />
                <Link href="/" className="text-lg font-semibold tracking-tight">
                  Your App
                </Link>
              </div>
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
            </div>
          </header>
          <div className="mx-auto flex w-full max-w-6xl flex-col pb-24 md:pb-6">
            <ProfileHero
              username={profile.username}
              profileImageFilename={profile.profileImageFilename}
              bannerImageFilename={profile.bannerImageFilename}
              action="edit"
            />
            <div className="flex flex-col gap-4 px-4 pt-4 sm:px-6">
              <ProfileShowcase />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

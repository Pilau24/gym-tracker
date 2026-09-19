import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { ProfileHero } from "@/components/profile-hero";
import { ProfileShowcase } from "@/components/profile-showcase";

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
    <div className="min-h-full bg-muted/30 text-foreground">
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
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileHero } from "@/components/profile-hero";
import { ProfileShowcase } from "@/components/profile-showcase";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { loadProfileWidgets } from "@/lib/profile-widgets";

export default async function EditPage() {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);
  const user = session?.userId
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

  if (!user) {
    redirect("/login");
  }
  const widgets = await loadProfileWidgets(user.id);

  return (
    <div className="min-h-full bg-muted/30 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col pb-24 md:pb-6">
        <ProfileHero
          username={user.username}
          profileImageFilename={user.profileImageFilename}
          bannerImageFilename={user.bannerImageFilename}
          action="view"
          editable
        />
        <div className="flex flex-col gap-4 px-4 pt-4 sm:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold tracking-tight">
              Customize your profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag widgets to reorder them and add removed widgets back from the
              overflow section.
            </p>
          </div>
          <ProfileShowcase editable initialWidgets={widgets} />
        </div>
      </div>
    </div>
  );
}

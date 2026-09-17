import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { ProfileSettings } from "@/components/profile-settings";

export default async function ProfilePage() {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);
  const user = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          username: true,
          profileImageFilename: true,
        },
      })
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6 py-12 text-foreground">
      <div className="flex flex-col gap-2">
        <Link
          href="/account"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Back to account
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Profile settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your username and profile picture.
        </p>
      </div>

      {user ? (
        <ProfileSettings
          username={user.username}
          profileImageFilename={user.profileImageFilename}
        />
      ) : (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          You must{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            log in
          </Link>{" "}
          before editing your profile.
        </p>
      )}
    </main>
  );
}

import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/session";
import { ImageUploader } from "@/components/image-uploader";
import { ThemeMenu } from "@/components/theme-menu";

export default async function UserSettingsPage() {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const userId = getUserIdFromSession(sessionToken);
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, profileImageFilename: true },
      })
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6 py-12 text-foreground">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          {user ? (
            <>
              Welcome back,{" "}
              <span className="capitalize">{user.username}</span>
            </>
          ) : (
            "Account settings"
          )}
        </h1>
      </div>

      {user ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/achievements"
              className="flex items-center gap-3 rounded-lg border p-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Trophy className="size-5 shrink-0" aria-hidden="true" />
              Records
            </Link>
            <div className="flex items-center gap-3 rounded-lg border p-4 text-sm font-medium text-muted-foreground">
              <Users className="size-5 shrink-0" aria-hidden="true" />
              Friends (coming soon)
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium">Theme</h2>
              <p className="text-sm text-muted-foreground">
                Choose how the app should look on this device.
              </p>
            </div>
            <ThemeMenu inSettings />
          </div>
          <div id="profile-picture">
            <ImageUploader
              profileImageFilename={user.profileImageFilename}
            />
          </div>
        </>
      ) : (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          You must{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            log in
          </Link>{" "}
          before uploading an image.
        </p>
      )}
    </main>
  );
}

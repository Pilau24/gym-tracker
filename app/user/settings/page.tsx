import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/session";
import { ImageUploader } from "@/components/image-uploader";

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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Account settings</h1>
      </div>

      {user ? (
        <ImageUploader
          username={user.username}
          profileImageFilename={user.profileImageFilename}
        />
      ) : (
        <p className="rounded-lg border p-6 text-muted-foreground">
          You must{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            log in
          </Link>{" "}
          before uploading an image.
        </p>
      )}
    </main>
  );
}

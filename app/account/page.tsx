import Link from "next/link";
import { cookies } from "next/headers";
import { KeyRound, Trophy, UserRound, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { ThemeMenu } from "@/components/theme-menu";
import { formatUsername } from "@/lib/username";

export default async function AccountPage() {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);
  const user = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          username: true,
        },
      })
    : null;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-6 py-12 text-foreground">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          {user ? (
            <>
              Account{" "}
              <span className="font-normal text-muted-foreground">
                · {formatUsername(user.username)}
              </span>
            </>
          ) : (
            "Your account"
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, account access, and preferences.
        </p>
      </header>

      {user ? (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">Account</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/profile/${encodeURIComponent(user.username)}`}
                className="flex min-h-24 flex-col justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <UserRound
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <Link
                href="/achievements"
                className="flex min-h-24 flex-col justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <Trophy
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Records</span>
              </Link>
              <div className="flex min-h-24 flex-col justify-between gap-3 rounded-lg border p-4 text-muted-foreground">
                <Users className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium">
                  Friends (coming soon)
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">Preferences</h2>
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose dark mode, light mode, or follow your device.
                  </p>
                </div>
                <ThemeMenu inSettings />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">Security</h2>
            <Link
              href="/account/security"
              className="flex min-h-24 flex-col justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <KeyRound
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">Passkeys</span>
            </Link>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/20 p-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium">Sign out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of this device.
                </p>
              </div>
              <LogoutButton />
            </div>
          </section>
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
          before managing your account.
        </p>
      )}
    </div>
  );
}

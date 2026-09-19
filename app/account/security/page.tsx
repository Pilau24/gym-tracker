import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { AddPasskeyButton } from "@/components/add-passkey-button";
import { PasskeyList } from "@/components/passkey-list";
import { SignOutAllButton } from "@/components/sign-out-all-button";

export default async function PasskeysPage() {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);
  const user = session?.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          username: true,
          credentials: {
            orderBy: { createdAt: "desc" },
            select: {
              credentialId: true,
              friendlyName: true,
              createdAt: true,
              lastUsed: true,
              backupEligible: true,
              backupStatus: true,
            },
          },
        },
      })
    : null;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center gap-6 px-6 py-12 text-foreground">
      <div className="flex flex-col gap-2">
        <Link
          href="/account"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Back to account
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Passkeys</h1>
        <p className="text-sm text-muted-foreground">
          Manage the devices and authenticators that can sign in to your
          account.
        </p>
      </div>

      {user ? (
        <>
          <PasskeyList
            currentCredentialId={session?.credentialId}
            credentials={user.credentials.map((credential) => ({
              ...credential,
              createdAt: credential.createdAt.toISOString(),
              lastUsed: credential.lastUsed?.toISOString() ?? null,
            }))}
          />
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium">Add a passkey</h2>
              <p className="text-sm text-muted-foreground">
                Register another device or authenticator for this account.
              </p>
            </div>
            <AddPasskeyButton />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/20 p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium">Sign out everywhere</h2>
              <p className="text-sm text-muted-foreground">
                Remove all passkeys and sign out on every device.
              </p>
            </div>
            <SignOutAllButton />
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
          before managing passkeys.
        </p>
      )}
    </div>
  );
}

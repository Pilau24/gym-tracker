"use client";

import { useState } from "react";
import { KeyRound, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Passkey = {
  credentialId: string;
  friendlyName: string;
  createdAt: string;
  lastUsed: string | null;
  backupEligible: boolean;
  backupStatus: boolean;
};

function formatPasskeyDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function PasskeyList({
  credentials,
  currentCredentialId,
}: {
  credentials: Passkey[];
  currentCredentialId?: string;
}) {
  const [passkeys, setPasskeys] = useState(credentials);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function deletePasskey(credentialId: string) {
    setError("");
    setDeletingId(credentialId);

    try {
      const response = await fetch(
        `/api/auth/passkeys/${encodeURIComponent(credentialId)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to delete passkey.");
      }

      setPasskeys((current) =>
        current.filter((passkey) => passkey.credentialId !== credentialId),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete passkey.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">Your passkeys</h2>
        <p className="text-sm text-muted-foreground">
          Passkeys registered on your account. The one used for this session
          can&apos;t be removed here.
        </p>
      </div>
      {passkeys.length ? (
        <div className="flex flex-col divide-y rounded-lg border">
          {passkeys.map((passkey) => (
            <div
              key={passkey.credentialId}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <KeyRound className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {passkey.friendlyName}
                    {passkey.credentialId === currentCredentialId && " (current)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Added {formatPasskeyDate(passkey.createdAt)}
                    {" · "}
                    {passkey.backupEligible && passkey.backupStatus
                      ? "Synced passkey"
                      : "Device passkey"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete passkey"
                onClick={() => deletePasskey(passkey.credentialId)}
                disabled={
                  passkey.credentialId === currentCredentialId ||
                  deletingId === passkey.credentialId
                }
              >
                {deletingId === passkey.credentialId ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <X aria-hidden="true" />
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          No passkeys are registered.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}

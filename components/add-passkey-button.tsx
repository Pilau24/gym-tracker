"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";
import { KeyRound, LoaderCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type RegistrationOptions = Parameters<typeof startRegistration>[0]["optionsJSON"] & {
  userId: string;
};

const GENERIC_ADD_PASSKEY_ERROR =
  "We couldn't add that passkey. Please try again.";

export function AddPasskeyButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [friendlyName, setFriendlyName] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsAdding(true);

    try {
      const optionsResponse = await fetch("/api/auth/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendlyName: friendlyName.trim() }),
      });
      const options = (await optionsResponse.json()) as
        | RegistrationOptions
        | { error?: string };

      if (!optionsResponse.ok || !("userId" in options)) {
        throw new Error(GENERIC_ADD_PASSKEY_ERROR);
      }

      const { userId, ...registrationOptions } = options;
      const credential = await startRegistration({
        optionsJSON: registrationOptions,
      });
      const verificationResponse = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credential }),
      });
      const verification = (await verificationResponse.json()) as {
        verified?: boolean;
      };

      if (!verificationResponse.ok || !verification.verified) {
        throw new Error(GENERIC_ADD_PASSKEY_ERROR);
      }

      setOpen(false);
      setFriendlyName("");
      router.refresh();
    } catch (addError) {
      setError(
        addError instanceof Error && addError.message === GENERIC_ADD_PASSKEY_ERROR
          ? addError.message
          : "Adding the passkey was cancelled or could not be completed.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setError("");
          setFriendlyName("");
        }
      }}
    >
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add passkey
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new passkey</DialogTitle>
            <DialogDescription>
              Give this passkey a name so you can recognize it later. You
              won&apos;t be able to change it afterwards.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={Boolean(error)}>
              <FieldLabel className="font-medium" htmlFor="friendly-name">
                Passkey name
              </FieldLabel>
              <Input
                id="friendly-name"
                name="friendlyName"
                placeholder="e.g. Work laptop"
                value={friendlyName}
                onChange={(event) => setFriendlyName(event.target.value)}
                aria-invalid={Boolean(error)}
                maxLength={80}
                disabled={isAdding}
              />
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription>
                  Leave blank to use a default name.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <KeyRound aria-hidden="true" data-icon="inline-start" />
              )}
              {isAdding ? "Waiting for passkey..." : "Create passkey"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ProfileSettings({
  username,
  profileImageFilename,
}: {
  username: string;
  profileImageFilename: string | null;
}) {
  const router = useRouter();
  const [nextUsername, setNextUsername] = useState(username);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveUsername(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: nextUsername }),
      });
      const result = (await response.json()) as {
        username?: string;
        error?: string;
      };
      if (!response.ok || !result.username) {
        setError(result.error ?? "Unable to update your username.");
        return;
      }
      setNextUsername(result.username);
      setMessage("Username updated.");
      router.refresh();
    } catch {
      setError("Unable to update your username. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update the name shown around the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={saveUsername}>
            <FieldGroup>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  value={nextUsername}
                  onChange={(event) => setNextUsername(event.target.value)}
                  pattern="[A-Za-z0-9]+"
                  maxLength={80}
                  required
                  aria-invalid={Boolean(error)}
                  disabled={isSaving}
                />
                {error ? (
                  <FieldError>{error}</FieldError>
                ) : (
                  <FieldDescription>
                    Use 1-80 letters and numbers only.
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
            <div className="flex items-center justify-between gap-3">
              {message ? (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check aria-hidden="true" />
                  {message}
                </p>
              ) : (
                <span />
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving && (
                  <LoaderCircle
                    className="animate-spin"
                    aria-hidden="true"
                  />
                )}
                {isSaving ? "Saving..." : "Save username"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ImageUploader
        profileImageFilename={profileImageFilename}
        compact
      />
    </div>
  );
}

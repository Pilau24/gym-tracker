"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

type RegistrationOptions = Parameters<typeof startRegistration>[0]["optionsJSON"] & {
  userId: string;
};

const GENERIC_REGISTER_ERROR =
  "We couldn't create a passkey. Check your details and try again.";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [friendlyName, setFriendlyName] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsRegistering(true);

    try {
      const optionsResponse = await fetch("/api/auth/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, friendlyName }),
      });
      const options = (await optionsResponse.json()) as
        | RegistrationOptions
        | { error?: string };

      if (!optionsResponse.ok || !("userId" in options)) {
        throw new Error(GENERIC_REGISTER_ERROR);
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
        throw new Error(GENERIC_REGISTER_ERROR);
      }

      router.push("/login");
    } catch (registrationError) {
      setError(
        registrationError instanceof Error &&
          registrationError.message === GENERIC_REGISTER_ERROR
          ? registrationError.message
          : "Registration was cancelled or could not be completed.",
      );
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Fingerprint aria-hidden="true" className="size-6" />
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-semibold">Create your passkey</CardTitle>
            <CardDescription className="text-sm leading-6">
              Set up secure, passwordless sign-in on this device.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(error)}>
                <FieldLabel className="font-medium" htmlFor="username">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="athlete123"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  pattern="[A-Za-z0-9]+"
                  aria-invalid={Boolean(error)}
                  required
                  disabled={isRegistering}
                />
                {error ? (
                  <FieldError>{error}</FieldError>
                ) : (
                  <FieldDescription>
                    Use 1-80 letters and numbers only.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel className="font-medium" htmlFor="email">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  disabled={isRegistering}
                />
                <FieldDescription>
                  Optional. Used to keep your contact email separate from your username.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel className="font-medium" htmlFor="friendly-name">
                  Passkey name
                </FieldLabel>
                <Input
                  id="friendly-name"
                  name="friendlyName"
                  placeholder="e.g. Work laptop"
                  value={friendlyName}
                  onChange={(event) => setFriendlyName(event.target.value)}
                  maxLength={80}
                  disabled={isRegistering}
                />
                <FieldDescription>
                  Helps you recognize this passkey later. You won&apos;t be
                  able to change it afterwards.
                </FieldDescription>
              </Field>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : (
                  <ShieldCheck className="size-4" data-icon="inline-start" aria-hidden="true" />
                )}
                {isRegistering
                  ? "Waiting for passkey..."
                  : "Create passkey"}
              </Button>
            </FieldGroup>
          </CardContent>
        </form>

        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link
              className="font-medium text-foreground underline underline-offset-4"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Fingerprint, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type AuthenticationOptions = Parameters<typeof startAuthentication>[0]["optionsJSON"] & {
  userId: string;
};
const GENERIC_LOGIN_ERROR =
  "We couldn't sign you in with that passkey. Check your details and try again.";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsAuthenticating(true);

    try {
      const optionsResponse = await fetch("/api/auth/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const options = (await optionsResponse.json()) as
        | AuthenticationOptions
        | { error?: string };

      if (!optionsResponse.ok || !("userId" in options)) {
        throw new Error(GENERIC_LOGIN_ERROR);
      }

      const { userId, ...authenticationOptions } = options;
      const credential = await startAuthentication({
        optionsJSON: authenticationOptions,
      });
      const verificationResponse = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credential }),
      });
      const verification = (await verificationResponse.json()) as {
        verified?: boolean;
        error?: string;
      };

      if (!verificationResponse.ok || !verification.verified) {
        throw new Error(GENERIC_LOGIN_ERROR);
      }

      router.push("/");
    } catch (authenticationError) {
      setError(
        authenticationError instanceof Error
          ? authenticationError.message === GENERIC_LOGIN_ERROR
            ? authenticationError.message
            : "Sign-in was cancelled or could not be completed."
          : "Sign-in was cancelled or could not be completed.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Fingerprint aria-hidden="true" className="size-6" />
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-sm leading-6">
              Sign in securely with the passkey saved on your device.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-5">
              {error && <FieldError>{error}</FieldError>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : (
                  <ShieldCheck className="size-4" data-icon="inline-start" aria-hidden="true" />
                )}
                {isAuthenticating ? "Waiting for passkey..." : "Continue with passkey"}
              </Button>
            </div>
          </CardContent>
        </form>

        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link
              className="font-medium text-foreground underline underline-offset-4"
              href="/register"
            >
              Create a passkey
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

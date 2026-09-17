"use client";

import { useState } from "react";
import { LoaderCircle, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SignOutAllButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOutAll() {
    setError("");
    setIsSigningOut(true);

    try {
      const response = await fetch("/api/auth/logout/all", { method: "POST" });

      if (!response.ok) {
        throw new Error("Unable to sign out everywhere.");
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Unable to sign out everywhere. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="destructive"
        onClick={handleSignOutAll}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <ShieldOff aria-hidden="true" />
        )}
        {isSigningOut ? "Signing out..." : "Sign out all"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

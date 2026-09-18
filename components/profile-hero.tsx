"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Eye,
  LoaderCircle,
  Users,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatUsername } from "@/lib/username";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function ProfileHero({
  username,
  profileImageFilename,
  bannerImageFilename,
  action,
  editable = false,
}: {
  username: string;
  profileImageFilename: string | null;
  bannerImageFilename: string | null;
  action: "edit" | "view";
  editable?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const nameFormRef = useRef<HTMLFormElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [nextUsername, setNextUsername] = useState(username);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const profileImageUrl = profileImageFilename
    ? `/uploads/${profileImageFilename}`
    : undefined;
  const bannerImageUrl = bannerImageFilename
    ? `/uploads/${bannerImageFilename}`
    : undefined;
  const isEditAction = action === "edit";

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isEditingName || isDiscardDialogOpen) return;

    function handleOutsidePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !nameFormRef.current?.contains(event.target)
      ) {
        if (nextUsername !== username) {
          setIsDiscardDialogOpen(true);
          return;
        }
        setNextUsername(username);
        setIsEditingName(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isDiscardDialogOpen, isEditingName, nextUsername, username]);

  function discardUsernameChanges() {
    setNextUsername(username);
    setIsDiscardDialogOpen(false);
    setIsEditingName(false);
  }

  async function saveUsername(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSavingName(true);

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
      setIsEditingName(false);
      setMessage("Username updated.");
      router.refresh();
    } catch {
      setError("Unable to update your username. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  }

  async function uploadImage(file: File, target: "profile" | "banner") {
    setMessage("");
    setError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be 2 MB or smaller.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("target", target);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "The upload failed.");
        return;
      }
      setMessage(
        target === "banner"
          ? "Profile banner updated."
          : "Profile picture updated.",
      );
      router.refresh();
    } catch {
      setError("The upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <section className="relative">
      <div className="sticky top-0 z-0">
        <button
          type="button"
          className="group relative block h-32 w-full overflow-hidden bg-primary/10 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          onClick={() => editable && bannerInputRef.current?.click()}
          disabled={!editable || isUploading}
          aria-label={editable ? "Change profile banner" : undefined}
        >
          {bannerImageUrl && (
            <Image
              src={bannerImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className={cn(
                "object-cover transition-[filter,transform] duration-300",
                isScrolled && "scale-105 blur-[2px]",
              )}
            />
          )}
          {editable && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {isUploading ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                "Change profile banner"
              )}
            </span>
          )}
        </button>
      </div>
      {editable && (
        <input
          ref={bannerInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadImage(file, "banner");
            event.target.value = "";
          }}
        />
      )}
      <div className="relative z-10 flex flex-col gap-3 px-4 pb-5 pt-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="group relative size-12 shrink-0 rounded-full text-left outline-none ring-4 ring-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            onClick={() => editable && inputRef.current?.click()}
            disabled={!editable || isUploading}
            aria-label={editable ? "Change profile picture" : undefined}
          >
            <Avatar className="size-12">
              {profileImageUrl && <AvatarImage src={profileImageUrl} alt="" />}
              <AvatarFallback>
                <UserRound className="size-[80%]" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            {editable && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {isUploading ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Camera aria-hidden="true" />
                )}
              </span>
            )}
          </button>
          {editable && (
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file, "profile");
                event.target.value = "";
              }}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {editable && isEditingName ? (
                <form
                  ref={nameFormRef}
                  className="flex min-w-0 flex-nowrap items-center gap-2"
                  onSubmit={saveUsername}
                >
                  <Input
                    className="min-w-0 flex-1"
                    value={formatUsername(nextUsername)}
                    onChange={(event) =>
                      setNextUsername(event.target.value.replace(/^@/, ""))
                    }
                    pattern="@?[A-Za-z0-9]+"
                    maxLength={81}
                    aria-label="Username"
                    required
                    disabled={isSavingName}
                    autoFocus
                  />
                  <Button
                    className="shrink-0 rounded-none"
                    type="submit"
                    size="sm"
                    disabled={isSavingName}
                  >
                    {isSavingName && (
                      <LoaderCircle
                        className="animate-spin"
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                    )}
                    Save
                  </Button>
                </form>
              ) : editable ? (
                <button
                  type="button"
                  className="w-fit text-left text-lg font-semibold tracking-tight outline-none focus-visible:underline"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setIsEditingName(true);
                  }}
                  aria-label="Edit username"
                >
                  {formatUsername(username)}
                </button>
              ) : (
                <h1 className="text-lg font-semibold tracking-tight">
                  {formatUsername(username)}
                </h1>
              )}
            {editable && !isEditingName && (
              <p className="text-xs text-muted-foreground">
                Tap your name or photo to edit.
              </p>
            )}
              {message && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check aria-hidden="true" />
                  {message}
                </p>
              )}
              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}
            <div className="flex items-center gap-1">
              <Users
                className="size-3 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-xs font-medium leading-none">0</p>
              <p className="text-[11px] text-muted-foreground leading-none">
                Friends
              </p>
            </div>
          </div>
          {isEditAction ? (
            <Button
              className="shrink-0 rounded-none !bg-card/90 !text-card-foreground shadow-sm backdrop-blur-sm hover:!bg-card"
              variant="outline"
              render={<Link href="/profile/edit" />}
              nativeButton={false}
            >
              Edit profile
            </Button>
          ) : (
            <Button
              className="shrink-0 rounded-none"
              variant="outline"
              render={
                <Link href={`/profile/${encodeURIComponent(username)}`} />
              }
              nativeButton={false}
            >
              <Eye data-icon="inline-start" />
              View profile
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 divide-x border bg-card py-3">
          <div className="flex flex-col gap-1 px-3">
            <span className="text-xs text-muted-foreground">
              Last recorded exercise
            </span>
            <span className="text-sm font-medium">0</span>
          </div>
          <div className="flex flex-col gap-1 px-3">
            <span className="text-xs text-muted-foreground">
              Most recent PR
            </span>
            <span className="text-sm font-medium">0</span>
          </div>
          <div className="flex flex-col gap-1 px-3">
            <span className="text-xs text-muted-foreground">Last seen</span>
            <span className="text-sm font-medium">recently</span>
          </div>
        </div>
      </div>
      </section>
      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard username changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your unsaved username changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardUsernameChanges}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

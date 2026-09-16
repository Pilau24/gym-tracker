"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp";

export function ImageUploader({
  profileImageFilename,
}: {
  profileImageFilename: string | null;
}) {
  const router = useRouter();
  const currentProfileImageUrl = profileImageFilename
    ? `/uploads/${profileImageFilename}`
    : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string>();

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file],
  );

  useEffect(() => {
    if (previewUrl) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  function chooseFile(candidate: File | undefined) {
    setMessage(undefined);
    if (!candidate) return;
    if (!candidate.type.startsWith("image/") || !ACCEPTED_TYPES.split(",").includes(candidate.type)) {
      setMessage("Choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (candidate.size > MAX_IMAGE_SIZE) {
      setMessage("The image must be 2 MB or smaller.");
      return;
    }
    setFile(candidate);
  }

  async function uploadImage() {
    if (!file) return;

    setIsUploading(true);
    setMessage(undefined);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !result.url) {
        setMessage(result.error ?? "The upload failed.");
        return;
      }
      setMessage("Profile picture uploaded successfully.");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setMessage("The upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle className="text-xl font-semibold">
          Upload a profile picture
        </CardTitle>
        <CardDescription>
          Your profile picture must be a JPEG, PNG, GIF, or WebP image no larger
          than 2 MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <button
          type="button"
          className={`flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
            isDragging ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            chooseFile(event.dataTransfer.files[0]);
          }}
        >
          {previewUrl || currentProfileImageUrl ? (
            <Image
              src={previewUrl ?? currentProfileImageUrl ?? ""}
              alt={
                previewUrl
                  ? "Selected profile picture preview"
                  : "Current profile picture"
              }
              width={160}
              height={160}
              unoptimized
              className="max-h-40 max-w-full rounded object-contain"
            />
          ) : (
            <>
              <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium text-foreground">
                Drag and drop an image here
              </span>
              <span className="text-sm text-muted-foreground">or click to browse</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button type="button" disabled={!file || isUploading} onClick={uploadImage}>
          {isUploading ? "Uploading..." : "Upload image"}
        </Button>
      </CardFooter>
    </Card>
  );
}

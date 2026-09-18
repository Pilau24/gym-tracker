import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/session";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads");

const IMAGE_TYPES = {
  "image/gif": { extension: "gif", signature: [0x47, 0x49, 0x46, 0x38] },
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": {
    extension: "png",
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
} as const;

function hasSignature(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function getImageDetails(type: string) {
  if (Object.hasOwn(IMAGE_TYPES, type)) {
    return IMAGE_TYPES[type as keyof typeof IMAGE_TYPES];
  }

  return undefined;
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const userId = getUserIdFromSession(sessionToken);

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a multipart form upload." }, { status: 400 });
  }

  const file = formData.get("image");
  const target = formData.get("target");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  }
  if (target !== "profile" && target !== "banner") {
    return NextResponse.json({ error: "An image target is required." }, { status: 400 });
  }

  const imageType = file.type;
  const imageDetails = getImageDetails(imageType);
  if (!imageDetails) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, GIF, and WebP images are supported." },
      { status: 415 },
    );
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "The image must be between 1 byte and 2 MB." },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasSignature(bytes, imageDetails.signature)) {
    return NextResponse.json({ error: "The uploaded file is not a valid image." }, { status: 415 });
  }
  if (imageType === "image/webp" && String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP") {
    return NextResponse.json({ error: "The uploaded file is not a valid WebP image." }, { status: 415 });
  }

  const filename = `${randomUUID()}.${imageDetails.extension}`;
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(path.join(UPLOAD_DIRECTORY, filename), bytes, { flag: "wx" });
  await prisma.user.update({
    where: { id: user.id },
    data:
      target === "banner"
        ? { bannerImageFilename: filename }
        : { profileImageFilename: filename },
  });

  return NextResponse.json(
    { url: `/uploads/${filename}` },
    { status: 201 },
  );
}

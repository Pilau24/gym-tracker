import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import {
  isValidUsername,
  USERNAME_MAX_LENGTH,
} from "@/lib/username";

export async function PATCH(request: Request) {
  const session = getSessionFromToken(
    (await cookies()).get("passkey_session")?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as { username?: unknown };
  const username =
    typeof body.username === "string" ? body.username.trim() : "";

  if (!isValidUsername(username)) {
    return NextResponse.json(
      {
        error: `Username must be 1-${USERNAME_MAX_LENGTH} characters and contain only letters and numbers.`,
      },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: session.userId },
    },
    select: { id: true },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "That username is already in use." },
      { status: 409 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { username },
    select: { username: true },
  });

  return NextResponse.json(user);
}

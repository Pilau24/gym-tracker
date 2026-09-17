import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";

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

  if (!username || username.length > 80) {
    return NextResponse.json(
      { error: "Username must be between 1 and 80 characters." },
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

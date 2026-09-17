import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";

export async function POST() {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);

  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  await prisma.credential.deleteMany({
    where: { internalUserId: session.userId },
  });

  const response = NextResponse.json({ loggedOut: true });
  response.cookies.delete("passkey_session");
  return response;
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSessionFromToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ credentialId: string }> },
) {
  const sessionToken = (await cookies()).get("passkey_session")?.value;
  const session = getSessionFromToken(sessionToken);
  const { credentialId } = await params;

  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  if (session.credentialId === credentialId) {
    return NextResponse.json(
      { error: "Your current passkey cannot be deleted." },
      { status: 400 },
    );
  }

  const credential = await prisma.credential.findFirst({
    where: { credentialId, internalUserId: session.userId },
    select: { credentialId: true },
  });

  if (!credential) {
    return NextResponse.json({ error: "Passkey not found." }, { status: 404 });
  }

  await prisma.credential.delete({ where: { credentialId } });
  return NextResponse.json({ deleted: true });
}

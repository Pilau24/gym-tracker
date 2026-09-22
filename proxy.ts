import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  if (process.env.AUTH_DEBUG === "true") {
    const sessionToken = request.cookies.get("passkey_session")?.value;
    const userId = getUserIdFromSession(sessionToken);
    const user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        })
      : null;
    const account = user?.username ?? (userId ? `user:${userId}` : "anonymous");

    console.info(
      `[request] account=${account} method=${request.method} path=${request.nextUrl.pathname}`,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

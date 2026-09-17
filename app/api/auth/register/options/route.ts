import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRpID, makeRegistrationOptions } from '@/lib/webauthn';
import { authDebug, authDebugError } from '@/lib/authDebug';
import { cookies } from 'next/headers';
import { getSessionFromToken } from '@/lib/session';

// In-memory challenge store for demo purposes. In production use a durable session store.
import { storeRegistrationChallenge } from '@/lib/challengeStore';

type JsonBody = Record<string, unknown>;
const REGISTER_ERROR = 'Unable to start registration.';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  authDebug('register-options:start', { requestId });
  let body: JsonBody | null = null;

  try {
    const parsed = await req.json();
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: REGISTER_ERROR }, { status: 400 });
    }
    body = parsed as JsonBody;
  } catch {
    return NextResponse.json({ error: REGISTER_ERROR }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const friendlyName = typeof body.friendlyName === 'string'
    ? body.friendlyName.trim().slice(0, 80)
    : 'Passkey';
  const session = getSessionFromToken((await cookies()).get('passkey_session')?.value);
  const authenticatedUserId = session?.userId;
  if (!username && !authenticatedUserId) {
    authDebug('register-options:invalid-username', { requestId });
    return NextResponse.json({ error: REGISTER_ERROR }, { status: 400 });
  }

  try {
    // Find or create user by username
    let user = authenticatedUserId
      ? await prisma.user.findUnique({ where: { id: authenticatedUserId } })
      : await prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await prisma.user.create({ data: { username } });
    }

    const rpName = process.env.RP_NAME ?? 'Passkey Auth Template';
    const rpID = getRpID(req);
    const expectedOrigin = process.env.RP_ORIGIN ?? new URL(req.url).origin;
    const credentialCount = await prisma.credential.count({
      where: { internalUserId: user.id },
    });

    const options = await makeRegistrationOptions({ rpName, rpID, userID: String(user.id), userName: user.username });

    const sessionId = crypto.randomUUID();
    storeRegistrationChallenge(sessionId, {
      challenge: options.challenge,
      userId: String(user.id),
      friendlyName: friendlyName || 'Passkey',
    });

    authDebug('register-options:success', {
      requestId,
      userId: user.id,
      credentialCount,
      rpName,
      rpID,
      expectedOrigin,
    });
    return NextResponse.json({ ...options, userId: sessionId });
  } catch (err: unknown) {
    authDebugError('register-options:error', err, { requestId });
    return NextResponse.json({ error: REGISTER_ERROR }, { status: 400 });
  }
}

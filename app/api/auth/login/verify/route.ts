import { NextResponse } from 'next/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { prisma } from '@/lib/db';
import { getRpID, verifyAuthentication } from '@/lib/webauthn';
import { consumeAuthenticationChallenge } from '@/lib/challengeStore';
import { createSessionToken } from '@/lib/session';
import { authDebug, authDebugError } from '@/lib/authDebug';

type JsonBody = Record<string, unknown>;
const LOGIN_ERROR = 'Unable to sign in with that passkey.';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  authDebug('login-verify:start', { requestId });
  let body: JsonBody | null = null;

  try {
    const parsed = await req.json();
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
    }
    body = parsed as JsonBody;
  } catch {
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
  }

  const rawUserId = body.userId;
  const userId = typeof rawUserId === 'string' || typeof rawUserId === 'number' ? String(rawUserId) : '';
  const credential = body.credential;

  if (typeof credential !== 'object' || credential === null || Array.isArray(credential) || !userId.trim()) {
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
  }

  try {
    const expectedChallenge = consumeAuthenticationChallenge(userId);
    if (!expectedChallenge) {
      authDebug('login-verify:challenge-missing-or-expired', { requestId });
      return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
    }

    const credentialRecord = credential as Record<string, unknown>;
    const credentialId = typeof credentialRecord.id === 'string' ? credentialRecord.id : '';
    if (!credentialId) {
      return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
    }

    const stored = await prisma.credential.findUnique({ where: { credentialId } });
    if (!stored) {
      authDebug('login-verify:credential-not-found', {
        requestId,
        credentialIdLength: credentialId.length,
      });
      return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
    }

    const rpID = getRpID(req);
    const expectedOrigin = process.env.RP_ORIGIN ?? new URL(req.url).origin;
    authDebug('login-verify:verifying', {
      requestId,
      rpID,
      expectedOrigin,
      credentialIdLength: credentialId.length,
      storedCounter: stored.counter,
    });
    const verification = await verifyAuthentication({
      credential: credential as AuthenticationResponseJSON,
      expectedChallenge,
      expectedCounter: Number(stored.counter),
      rpID,
      expectedOrigin,
      credentialPublicKey: stored.publicKey as Buffer,
      transports: stored.transports
        ? JSON.parse(stored.transports) as string[]
        : undefined,
    });

    if (!verification.verified) {
      authDebug('login-verify:rejected', { requestId });
      return NextResponse.json({ verified: false, error: LOGIN_ERROR }, { status: 400 });
    }

    // update counter and lastUsed
    const newCounter =
      verification.authenticationInfo?.newCounter ??
      stored.counter + 1;

    await prisma.credential.update({
      where: { credentialId },
      data: { counter: Number(newCounter), lastUsed: new Date() },
    });

    const response = NextResponse.json({ verified: true });
    response.cookies.set({
      name: 'passkey_session',
      value: createSessionToken(stored.internalUserId, stored.credentialId),
      httpOnly: true,
      sameSite: 'lax',
      secure: new URL(req.url).protocol === 'https:',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    authDebug('login-verify:success', {
      requestId,
      userId: stored.internalUserId,
      newCounter,
      credentialDeviceType: verification.authenticationInfo?.credentialDeviceType,
      credentialBackedUp: verification.authenticationInfo?.credentialBackedUp,
    });
    return response;
  } catch (err: unknown) {
    authDebugError('login-verify:error', err, { requestId });
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
  }
}

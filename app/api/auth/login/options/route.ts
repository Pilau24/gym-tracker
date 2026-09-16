import { NextResponse } from 'next/server';
import { getRpID, makeAuthenticationOptions } from '@/lib/webauthn';
import { storeAuthenticationChallenge } from '@/lib/challengeStore';
import { authDebug, authDebugError } from '@/lib/authDebug';

const LOGIN_ERROR = 'Unable to start sign-in.';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  authDebug('login-options:start', { requestId });
  try {
    const rpID = getRpID(req);
    const options = await makeAuthenticationOptions({ rpID });
    const challengeKey = crypto.randomUUID();

    // Use a random challenge key so the response never exposes whether a user exists.
    storeAuthenticationChallenge(challengeKey, options.challenge);

    authDebug('login-options:success', {
      requestId,
      rpID,
      expectedOrigin: process.env.RP_ORIGIN ?? new URL(req.url).origin,
    });
    return NextResponse.json({ ...options, userId: challengeKey });
  } catch (err: unknown) {
    authDebugError('login-options:error', err, { requestId });
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 400 });
  }
}

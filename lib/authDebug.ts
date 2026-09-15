type AuthDebugDetails = Record<string, boolean | number | string | undefined>;

export function authDebug(
  event: string,
  details: AuthDebugDetails = {},
) {
  if (process.env.AUTH_DEBUG !== "true") return;

  console.info(`[auth-debug] ${event}`, details);
}

export function authDebugError(
  event: string,
  error: unknown,
  details: AuthDebugDetails = {},
) {
  if (process.env.AUTH_DEBUG !== "true") return;

  console.error(`[auth-debug] ${event}`, {
    ...details,
    error: error instanceof Error ? error.message : String(error),
  });
}

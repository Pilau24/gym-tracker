const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USERNAME_MIN_LENGTH = 1;
export const USERNAME_MAX_LENGTH = 80;

export function isValidUsername(username: string) {
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(username)
  );
}

export function formatUsername(username: string) {
  return `@${username}`;
}

export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

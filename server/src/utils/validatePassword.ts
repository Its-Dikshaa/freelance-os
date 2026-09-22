// Favors minimum length over complexity requirements (composition rules like
// forcing symbols/numbers push users toward predictable patterns and add
// friction without meaningfully improving security).
const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.trim().length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  return null;
}

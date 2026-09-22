import rateLimit from 'express-rate-limit';

// Rate limiters are IP-scoped and would otherwise throttle the test suite,
// which legitimately signs up many users in quick succession from the same
// loopback address. Vitest sets NODE_ENV=test by default.
const skipInTests = () => process.env.NODE_ENV === 'test';

// Login is the brute-force target (a guess only costs a password attempt),
// so it gets the tighter window.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Signup abuse (mass account creation) is lower-frequency but still worth capping.
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { error: 'Too many signup attempts. Please try again later.' }
});

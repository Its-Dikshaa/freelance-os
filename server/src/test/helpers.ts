import request from 'supertest';
import { createApp } from '../app';

export const app = createApp();

let counter = 0;

export async function createTestUser() {
  counter += 1;
  const email = `test-user-${counter}-${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Test User', email, password: 'password123' });

  if (res.status !== 201) {
    throw new Error(`Test signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { token: res.body.token as string, userId: res.body.user._id as string, email };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

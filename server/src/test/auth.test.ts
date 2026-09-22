import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './helpers';

describe('Signup password validation', () => {
  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Short Pw',
      email: `short-pw-${Date.now()}@example.com`,
      password: 'abc123'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 8 characters/i);
  });

  it('accepts an 8+ character password', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Long Pw',
      email: `long-pw-${Date.now()}@example.com`,
      password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, createTestUser, authHeader } from './helpers';

describe('Ownership isolation', () => {
  it('user A cannot read user B\'s projects', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();

    await request(app).post('/api/projects').set(authHeader(userB.token))
      .send({ id: 'p1', name: 'B Project', client: 'Acme', status: 'Active', progress: 0, budget: 1000, deadline: '2026-01-01' });

    const asA = await request(app).get('/api/projects').set(authHeader(userA.token));
    expect(asA.body).toHaveLength(0);
  });

  it('user A cannot update or delete user B\'s project by guessing its id', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();

    await request(app).post('/api/projects').set(authHeader(userB.token))
      .send({ id: 'shared-id', name: 'B Project', client: 'Acme', status: 'Active', progress: 0, budget: 1000, deadline: '2026-01-01' });

    const updateAttempt = await request(app).put('/api/projects/shared-id').set(authHeader(userA.token)).send({ name: 'Hijacked' });
    expect(updateAttempt.status).toBe(404);

    const deleteAttempt = await request(app).delete('/api/projects/shared-id').set(authHeader(userA.token));
    expect(deleteAttempt.status).toBe(404);

    const stillThere = await request(app).get('/api/projects').set(authHeader(userB.token));
    expect(stillThere.body).toHaveLength(1);
    expect(stillThere.body[0].name).toBe('B Project');
  });

  it('rejects requests with no token and with an invalid token', async () => {
    const noToken = await request(app).get('/api/projects');
    expect(noToken.status).toBe(401);

    const badToken = await request(app).get('/api/projects').set(authHeader('not-a-real-token'));
    expect(badToken.status).toBe(403);
  });
});

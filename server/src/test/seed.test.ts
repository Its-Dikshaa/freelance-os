import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, createTestUser, authHeader } from './helpers';

describe('POST /api/seed', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/seed');
    expect(res.status).toBe(401);
  });

  it('only reseeds the calling user\'s own data', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();

    await request(app).post('/api/clients').set(authHeader(userB.token))
      .send({ id: 'b1', name: 'User B Client', industry: 'Other' });

    const seeded = await request(app).post('/api/seed').set(authHeader(userA.token));
    expect(seeded.status).toBe(200);

    const bClients = await request(app).get('/api/clients').set(authHeader(userB.token));
    expect(bClients.body).toHaveLength(1);
    expect(bClients.body[0].id).toBe('b1');

    const aClients = await request(app).get('/api/clients').set(authHeader(userA.token));
    expect(aClients.body.length).toBeGreaterThan(0);
  });
});

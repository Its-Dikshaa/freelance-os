import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, createTestUser, authHeader } from './helpers';

// Regression guard for the FE/BE field-name mismatch bug class: every field
// the frontend actually sends on create must come back with the same name
// and value on a subsequent read. Before this fix, several of these fields
// were silently renamed or dropped by the backend and came back `undefined`.

describe('Project field contract', () => {
  it('round-trips every field the frontend sends', async () => {
    const { token } = await createTestUser();
    const payload = {
      id: 'p1', name: 'Test Project', client: 'Acme Co', status: 'Active',
      progress: 42, budget: 50000, deadline: '2026-05-01', desc: 'A test project', color: '#123456'
    };

    const created = await request(app).post('/api/projects').set(authHeader(token)).send(payload);
    expect(created.status).toBe(201);

    const fetched = await request(app).get('/api/projects').set(authHeader(token));
    expect(fetched.status).toBe(200);
    expect(fetched.body).toHaveLength(1);

    const p = fetched.body[0];
    for (const [key, value] of Object.entries(payload)) {
      expect(p[key], `field "${key}"`).toEqual(value);
    }
  });
});

describe('Task field contract', () => {
  it('round-trips every field the frontend sends', async () => {
    const { token } = await createTestUser();
    const payload = { id: 't1', title: 'Test Task', project: 'Test Project', status: 'InProgress', due: 'Mar 30' };

    const created = await request(app).post('/api/tasks').set(authHeader(token)).send(payload);
    expect(created.status).toBe(201);

    const fetched = await request(app).get('/api/tasks').set(authHeader(token));
    const t = fetched.body[0];
    for (const [key, value] of Object.entries(payload)) {
      expect(t[key], `field "${key}"`).toEqual(value);
    }
  });
});

describe('Client field contract', () => {
  it('round-trips every field the frontend sends', async () => {
    const { token } = await createTestUser();
    const payload = {
      id: 'c1', name: 'Test Client', industry: 'Logistics', email: 'client@example.com',
      phone: '9876543210', notes: 'Important client', projects: 0, value: 0,
      color: '#654321', initials: 'TC'
    };

    const created = await request(app).post('/api/clients').set(authHeader(token)).send(payload);
    expect(created.status).toBe(201);

    const fetched = await request(app).get('/api/clients').set(authHeader(token));
    const c = fetched.body[0];
    for (const [key, value] of Object.entries(payload)) {
      expect(c[key], `field "${key}"`).toEqual(value);
    }
  });
});

describe('Invoice field contract', () => {
  it('round-trips every field the frontend sends', async () => {
    const { token } = await createTestUser();
    const payload = {
      id: 'i1', num: 'INV-001', client: 'Test Client', amount: 15000,
      date: '2026-03-01', due: '2026-03-15', status: 'Unpaid', desc: 'Test invoice'
    };

    const created = await request(app).post('/api/invoices').set(authHeader(token)).send(payload);
    expect(created.status).toBe(201);

    const fetched = await request(app).get('/api/invoices').set(authHeader(token));
    const inv = fetched.body[0];
    for (const [key, value] of Object.entries(payload)) {
      expect(inv[key], `field "${key}"`).toEqual(value);
    }
  });
});

describe('PUT update integrity', () => {
  it('an edit cannot rewrite the record id or userId', async () => {
    const { token } = await createTestUser();
    const other = await createTestUser();

    await request(app).post('/api/projects').set(authHeader(token))
      .send({ id: 'p1', name: 'Original', client: 'Acme', status: 'Active', progress: 0, budget: 1000, deadline: '2026-01-01' });

    const updated = await request(app).put('/api/projects/p1').set(authHeader(token))
      .send({ name: 'Renamed', id: 'p2', userId: other.userId });

    expect(updated.status).toBe(200);
    expect(updated.body.id).toBe('p1');
    expect(updated.body.userId).not.toBe(other.userId);
    expect(updated.body.name).toBe('Renamed');
  });
});

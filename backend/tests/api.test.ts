import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from '../src/app.js';

// Test the Express app with supertest
const request = supertest(app);

describe('Health Check', () => {
  it('GET /health should return ok', async () => {
    const res = await request.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Projects API', () => {
  it('GET /api/projects should return array', async () => {
    const res = await request.get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Analytics API', () => {
  it('POST /api/analytics/track should accept section', async () => {
    const res = await request.post('/api/analytics/track').send({ section: 'hero' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('POST /api/analytics/track should reject empty section', async () => {
    const res = await request.post('/api/analytics/track').send({ section: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/requerid[oa]/);
  });
});

describe('Contact API', () => {
  it('POST /api/contact should create message', async () => {
    const res = await request.post('/api/contact').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello, this is a test message.',
    });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it('POST /api/contact should reject invalid email', async () => {
    const res = await request.post('/api/contact').send({
      name: 'Test',
      email: 'not-an-email',
      message: 'Test',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('email');
  });

  it('POST /api/contact should reject missing fields', async () => {
    const res = await request.post('/api/contact').send({});
    expect(res.status).toBe(400);
    // Zod retorna mensaje con "expected string, received undefined" o con "requerid"
    expect(res.body.error).toMatch(/requerid|expected string, received undefined/i);
  });
});

describe('Auth API', () => {
  it('POST /api/auth/login should reject missing credentials', async () => {
    const res = await request.post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    // Zod retorna mensaje con "expected string, received undefined" o con "requerid"
    expect(res.body.error).toMatch(/requerid|expected string, received undefined/i);
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'invalid@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request.get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from '../src/app.js';
import { getValidToken, getAuthHeaders, getCsrfConfig } from './helpers/auth.js';
import { createTestProject, buildCreateProjectPayload, createTestMessage } from './helpers/factories.js';
import prisma from '../src/lib/prisma.js';

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

  it('GET /api/projects list items must not contain content key', async () => {
    const res = await request.get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const item of res.body) {
      expect(item).not.toHaveProperty('content');
    }
  });

  it('GET /api/projects list items must include slug', async () => {
    const res = await request.get('/api/projects');
    expect(res.status).toBe(200);
    for (const item of res.body) {
      expect(item).toHaveProperty('slug');
      expect(typeof item.slug).toBe('string');
    }
  });

  it('GET /api/projects/:slug returns project with content', async () => {
    const res = await request.get('/api/projects/seed-project-1');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('seed-project-1');
    expect(res.body).toHaveProperty('content');
  });

  it('GET /api/projects/:slug returns 404 for unknown slug', async () => {
    const res = await request.get('/api/projects/does-not-exist-ever');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Project not found');
  });

  it('GET /api/projects/:slug returns 404 for invalid slug format', async () => {
    const res = await request.get('/api/projects/INVALID_SLUG');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Project not found');
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
    // Zod 4 returns "expected string, received undefined" for missing fields
    expect(res.body.error).toMatch(/requerid|expected string, received undefined/i);
  });
});

describe('Auth API', () => {
  // ── Existing tests (preserved) ──
  it('POST /api/auth/login should reject missing credentials', async () => {
    const res = await request.post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/requerid|expected string, received undefined/i);
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'invalid@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  // ── Login (RED phase tests) ──
  describe('Login', () => {
    it('should reject invalid email format', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'not-an-email',
        password: 'testpassword',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should reject wrong password', async () => {
      const res = await request.post('/api/auth/login').send({
        email: process.env['ADMIN_EMAIL'] ?? 'admin@example.com',
        password: 'thisiswrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Credenciales inválidas');
    });

    it('should reject non-existent email', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'nobody@nowhere.com',
        password: 'testpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Credenciales inválidas');
    });

    it('should login successfully and return user + tokens', async () => {
      const res = await request.post('/api/auth/login').send({
        email: process.env['ADMIN_EMAIL'] ?? 'admin@example.com',
        password: process.env['ADMIN_PASSWORD'] ?? 'testpassword',
      });
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(process.env['ADMIN_EMAIL']);
      expect(res.body.accessToken).toBeDefined();
      expect(typeof res.body.accessToken).toBe('string');

      // Should set 3 cookies: csrf-token, accessToken, refreshToken
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('csrf-token=');
      expect(cookieStr).toContain('accessToken=');
      expect(cookieStr).toContain('refreshToken=');
    });
  });

  // ── Refresh Token ──
  describe('Refresh Token', () => {
    it('should return new accessToken with valid refresh token', async () => {
      const { tokens, headers } = await getCsrfConfig(app);
      const res = await request
        .post('/api/auth/refresh')
        .set(headers)
        .send({ refreshToken: tokens.refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('should reject request without refresh token', async () => {
      const { headers } = await getCsrfConfig(app);
      const res = await request
        .post('/api/auth/refresh')
        .set(headers)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Refresh token');
    });

    it('should reject invalid refresh token', async () => {
      const { headers } = await getCsrfConfig(app);
      const res = await request
        .post('/api/auth/refresh')
        .set(headers)
        .send({ refreshToken: 'this-is-not-a-valid-refresh-token' });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });

    it('should reject revoked refresh token', async () => {
      // Login → logout (revokes token) → try to refresh
      const loginTokens = await getValidToken(app);

      // Logout with full cookie set to revoke the refresh token
      const fullCookieHeaders = {
        Cookie: `csrf-token=${loginTokens.csrfToken}; accessToken=${loginTokens.accessToken}; refreshToken=${loginTokens.refreshToken}`,
        'x-csrf-token': loginTokens.csrfToken,
      };
      await request.post('/api/auth/logout').set(fullCookieHeaders).expect(200);

      // Try to refresh with the (now revoked) token
      const csrfHeaders = getAuthHeaders(loginTokens.csrfToken, loginTokens.accessToken);
      const res = await request
        .post('/api/auth/refresh')
        .set(csrfHeaders)
        .send({ refreshToken: loginTokens.refreshToken });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('revoked');
    });
  });

  // ── Logout ──
  describe('Logout', () => {
    it('should logout successfully with valid session', async () => {
      const { headers } = await getCsrfConfig(app);
      const res = await request.post('/api/auth/logout').set(headers);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Response should clear cookies (Max-Age=0 in Express 5)
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
        expect(cookieStr.toLowerCase()).toContain('max-age=0');
      }
    });

    it('should reject logout without auth (CSRF check first)', async () => {
      const res = await request.post('/api/auth/logout');
      // CSRF check (403) runs before requireAuth (401) for POST routes
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF');
    });
  });

  // ── GET /me ──
  describe('GET /me', () => {
    it('should return user with valid access token', async () => {
      const loginTokens = await getValidToken(app);
      const res = await request
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${loginTokens.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(process.env['ADMIN_EMAIL']);
      expect(res.body.user.id).toBeDefined();
    });

    it('should reject without token', async () => {
      const res = await request.get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // ── CSRF Protection ──
  describe('CSRF Protection', () => {
    it('should reject POST without x-csrf-token header', async () => {
      const loginTokens = await getValidToken(app);
      const res = await request
        .post('/api/auth/logout')
        .set('Cookie', `csrf-token=${loginTokens.csrfToken}; accessToken=${loginTokens.accessToken}`);
      // No x-csrf-token header → CSRF check fails
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF');
    });

    it('should reject POST with mismatched csrf-token', async () => {
      const loginTokens = await getValidToken(app);
      // Use different 64-char hex string to avoid timingSafeEqual length mismatch
      const res = await request
        .post('/api/auth/logout')
        .set('Cookie', `csrf-token=${loginTokens.csrfToken}; accessToken=${loginTokens.accessToken}`)
        .set('x-csrf-token', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF');
    });

    it('should allow GET requests without CSRF (safe method bypass)', async () => {
      // GET with CSRF nonsense should not return 403
      const res = await request
        .get('/api/auth/me')
        .set('x-csrf-token', 'ignored');
      // Should either succeed or fail auth, not CSRF
      expect(res.status).not.toBe(403);
    });
  });

  // ── Rate Limiting ──
  describe('Rate Limiting', () => {
    it('should block after 5 failed login attempts', async () => {
      const email = 'ratelimit@test.com';

      // 5 failed attempts → each returns 401
      for (let i = 0; i < 5; i++) {
        const res = await request
          .post('/api/auth/login')
          .send({ email, password: 'wrongpassword' });
        expect(res.status).toBe(401);
      }

      // 6th attempt → locked out (429)
      const locked = await request
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });
      expect(locked.status).toBe(429);
      expect(locked.body.error).toContain('bloqueada');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Admin — Projects CRUD
// ═══════════════════════════════════════════════════════════════
describe('Admin — Projects CRUD', () => {
  it('POST /api/projects should reject without auth (CSRF runs first)', async () => {
    const res = await request
      .post('/api/projects')
      .send(buildCreateProjectPayload());
    // CSRF check runs before requireAuth → 403, not 401
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('CSRF');
  });

  it('POST /api/projects should reject with auth but no CSRF header', async () => {
    const tokens = await getValidToken(app);
    // Cookie with csrf-token but no x-csrf-token header
    const res = await request
      .post('/api/projects')
      .set('Cookie', `csrf-token=${tokens.csrfToken}; accessToken=${tokens.accessToken}`)
      .send(buildCreateProjectPayload());
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('CSRF');
  });

  it('POST /api/projects should create project with valid auth + CSRF', async () => {
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .post('/api/projects')
      .set(headers)
      .send(buildCreateProjectPayload());
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('New Project');
    expect(res.body.slug).toBe('new-project');
  });

  it('POST /api/projects should reject empty title', async () => {
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .post('/api/projects')
      .set(headers)
      .send(buildCreateProjectPayload({ title: '' }));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('título es requerido');
  });

  it('POST /api/projects should reject empty stack', async () => {
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .post('/api/projects')
      .set(headers)
      .send(buildCreateProjectPayload({ stack: [] }));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Agregá al menos una tecnología');
  });

  it('PATCH /api/projects/:id should update project with auth + CSRF', async () => {
    const project = await createTestProject(prisma);
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .patch(`/api/projects/${project.id}`)
      .set(headers)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
    expect(res.body.id).toBe(project.id);
  });

  it('PATCH /api/projects/:id should return 404 for non-existent ID', async () => {
    const { headers } = await getCsrfConfig(app);
    const fakeId = '00000000-0000-4000-8000-000000000000';
    const res = await request
      .patch(`/api/projects/${fakeId}`)
      .set(headers)
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('no fue encontrado');
  });

  it('PATCH /api/projects/:id should reject without CSRF header', async () => {
    const project = await createTestProject(prisma);
    const tokens = await getValidToken(app);
    const res = await request
      .patch(`/api/projects/${project.id}`)
      .set('Cookie', `csrf-token=${tokens.csrfToken}; accessToken=${tokens.accessToken}`)
      .send({ title: 'No CSRF' });
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('CSRF');
  });

  it('DELETE /api/projects/:id should delete existing project', async () => {
    const project = await createTestProject(prisma);
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .delete(`/api/projects/${project.id}`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('DELETE /api/projects/:id should return 404 for non-existent ID', async () => {
    const { headers } = await getCsrfConfig(app);
    const fakeId = '00000000-0000-4000-8000-000000000000';
    const res = await request
      .delete(`/api/projects/${fakeId}`)
      .set(headers);
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('no fue encontrado');
  });

  it('DELETE /api/projects/:id should reject without auth (CSRF runs first)', async () => {
    const project = await createTestProject(prisma);
    const res = await request.delete(`/api/projects/${project.id}`);
    // CSRF runs first on POST/PATCH/DELETE admin routes
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('CSRF');
  });

  it('PATCH /api/projects/:id should update content field', async () => {
    const project = await createTestProject(prisma);
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .patch(`/api/projects/${project.id}`)
      .set(headers)
      .send({ content: '# My Content\n\nSome markdown here.' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(project.id);
    // content is not in the list/update response (ProjectResponse excludes it)
    // but the update should succeed
  });

  it('PATCH /api/projects/:id should update slug manually', async () => {
    const project = await createTestProject(prisma, { slug: `update-slug-test-${Date.now()}` });
    const { headers } = await getCsrfConfig(app);
    const newSlug = `updated-slug-${Date.now()}`;
    const res = await request
      .patch(`/api/projects/${project.id}`)
      .set(headers)
      .send({ slug: newSlug });
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe(newSlug);
  });

  it('PATCH /api/projects/:id should return 409 on duplicate slug', async () => {
    const slugA = `slug-conflict-a-${Date.now()}`;
    const slugB = `slug-conflict-b-${Date.now()}`;
    const projectA = await createTestProject(prisma, { slug: slugA });
    await createTestProject(prisma, { slug: slugB });
    const { headers } = await getCsrfConfig(app);
    // Try to set projectA's slug to slugB (which already exists)
    const res = await request
      .patch(`/api/projects/${projectA.id}`)
      .set(headers)
      .send({ slug: slugB });
    expect(res.status).toBe(409);
  });
});

// ═══════════════════════════════════════════════════════════════
// Admin — Contact Messages CRUD
// ═══════════════════════════════════════════════════════════════
describe('Admin — Contact Messages CRUD', () => {
  it('GET /api/contact/messages should return messages with auth', async () => {
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .get('/api/contact/messages')
      .set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Seed baseline has 2 messages, plus any created by previous tests
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
    expect(res.body[0]).toHaveProperty('message');
    expect(res.body[0]).toHaveProperty('read');
    expect(res.body[0]).toHaveProperty('createdAt');
  });

  it('GET /api/contact/messages should reject without auth', async () => {
    const res = await request.get('/api/contact/messages');
    // GET /messages has requireAuth inline (no CSRF on GET)
    expect(res.status).toBe(401);
  });

  it('PATCH /api/contact/:id/read should mark as read', async () => {
    const msg = await createTestMessage(prisma, { read: false });
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .patch(`/api/contact/${msg.id}/read`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
    expect(res.body.category).toBe('leido');
  });

  it('PATCH /api/contact/:id/unread should mark as unread', async () => {
    const msg = await createTestMessage(prisma, { read: true });
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .patch(`/api/contact/${msg.id}/unread`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(false);
    expect(res.body.category).toBe('no-leido');
  });

  it('PATCH /api/contact/:id/category should update category', async () => {
    const msg = await createTestMessage(prisma);
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .patch(`/api/contact/${msg.id}/category`)
      .set(headers)
      .send({ category: 'trabajo' });
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('trabajo');
  });

  it('PATCH /api/contact/:id/read should return 404 for non-existent ID', async () => {
    const { headers } = await getCsrfConfig(app);
    const fakeId = '00000000-0000-0000-0000-000000000999';
    const res = await request
      .patch(`/api/contact/${fakeId}/read`)
      .set(headers);
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('no fue encontrado');
  });

  it('DELETE /api/contact/:id should delete existing message', async () => {
    const msg = await createTestMessage(prisma);
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .delete(`/api/contact/${msg.id}`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('DELETE /api/contact/:id should return 404 for non-existent ID', async () => {
    const { headers } = await getCsrfConfig(app);
    const fakeId = '00000000-0000-0000-0000-000000000999';
    const res = await request
      .delete(`/api/contact/${fakeId}`)
      .set(headers);
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('no fue encontrado');
  });
});

// ═══════════════════════════════════════════════════════════════
// Admin — Analytics Stats
// ═══════════════════════════════════════════════════════════════
describe('Admin — Analytics Stats', () => {
  it('GET /api/analytics/stats should return stats with auth', async () => {
    const { headers } = await getCsrfConfig(app);
    const res = await request
      .get('/api/analytics/stats')
      .set(headers);
    expect(res.status).toBe(200);
    // Stats object shape
    expect(res.body).toHaveProperty('totalVisits');
    expect(res.body).toHaveProperty('todayVisits');
    expect(res.body).toHaveProperty('sectionViews');
    expect(res.body).toHaveProperty('dailyVisits');
    expect(res.body).toHaveProperty('unreadMessages');
    expect(res.body).toHaveProperty('mostViewedSection');
    // At least 1 page view was tracked by the Analytics API test
    expect(typeof res.body.totalVisits).toBe('number');
    expect(res.body.totalVisits).toBeGreaterThanOrEqual(1);
    // Seed has at least 1 unread message
    expect(res.body.unreadMessages).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/analytics/stats should reject without auth', async () => {
    const res = await request.get('/api/analytics/stats');
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

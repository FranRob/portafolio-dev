import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { getStats, trackView } from './analytics.service.js';
import { asyncHandler } from '../../lib/errorMiddleware.js';
import { ValidationError } from '../../lib/errors.js';

const router = Router();

const trackSchema = z.object({
  section: z.string().min(1, 'La sección es requerida'),
  sessionId: z.string().optional(),
});

router.post('/track', asyncHandler(async (req: Request, res: Response) => {
  const parsed = trackSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }

  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const referrer = req.headers['referer'] ?? req.headers['referrer'];

  await trackView(
    parsed.data.section,
    userAgent,
    ip,
    typeof referrer === 'string' ? referrer : undefined,
    parsed.data.sessionId,
  );

  res.json({ ok: true });
}));

router.get('/stats', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const range = (['7d', '30d', 'all'] as const).includes(req.query.range as '7d' | '30d' | 'all')
    ? (req.query.range as '7d' | '30d' | 'all')
    : 'all';
  const stats = await getStats(range);
  res.json(stats);
}));

export default router;

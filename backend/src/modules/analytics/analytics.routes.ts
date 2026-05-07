import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { getStats, trackView } from './analytics.service.js';
import { asyncHandler } from '../../lib/errorMiddleware.js';
import { ValidationError } from '../../lib/errors.js';

const router = Router();

const trackSchema = z.object({
  section: z.string().min(1, 'La sección es requerida'),
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
  );

  res.json({ ok: true });
}));

router.get('/stats', requireAuth, asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getStats();
  res.json(stats);
}));

export default router;

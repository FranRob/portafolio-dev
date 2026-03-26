import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { getStats, trackView } from './analytics.service.js';

const router = Router();

const trackSchema = z.object({
  section: z.string().min(1),
});

router.post('/track', async (req: Request, res: Response) => {
  const parsed = trackSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
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
});

router.get('/stats', requireAuth, async (_req: Request, res: Response) => {
  const stats = await getStats();
  res.json(stats);
});

export default router;

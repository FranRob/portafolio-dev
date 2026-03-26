import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { createMessage, getAllMessages, markAsRead } from './contact.service.js';

const router = Router();

const createMessageSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = createMessageSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const saved = await createMessage(parsed.data);
  res.status(201).json({ ok: true, id: saved.id });
});

router.get('/messages', requireAuth, async (_req: Request, res: Response) => {
  const messages = await getAllMessages();
  res.json(messages);
});

router.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await markAsRead(id);
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Message not found' });
  }
});

export default router;

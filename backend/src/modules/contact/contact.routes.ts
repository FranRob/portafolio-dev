import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { createMessage, getAllMessages, markAsRead, markAsUnread, updateCategory, deleteMessage } from './contact.service.js';
import { asyncHandler } from '../../lib/errorMiddleware.js';
import { ValidationError, NotFoundError } from '../../lib/errors.js';

const router = Router();

const createMessageSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().min(1, 'El email es requerido').email('El email debe tener formato válido'),
  message: z.string().min(1, 'El mensaje es requerido').max(5000),
});

const categorySchema = z.object({
  category: z.string().min(1, 'La categoría es requerida').max(50),
});

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }
  const saved = await createMessage(parsed.data);
  res.status(201).json({ ok: true, id: saved.id });
}));

router.get('/messages', requireAuth, asyncHandler(async (_req: Request, res: Response) => {
  const messages = await getAllMessages();
  res.json(messages);
}));

router.patch('/:id/read', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const updated = await markAsRead(id);
  if (!updated) {
    throw new NotFoundError('Mensaje', id);
  }
  res.json(updated);
}));

router.patch('/:id/unread', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const updated = await markAsUnread(id);
  if (!updated) {
    throw new NotFoundError('Mensaje', id);
  }
  res.json(updated);
}));

router.patch('/:id/category', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }
  const updated = await updateCategory(id, parsed.data.category);
  if (!updated) {
    throw new NotFoundError('Mensaje', id);
  }
  res.json(updated);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const deleted = await deleteMessage(id);
  if (!deleted) {
    throw new NotFoundError('Mensaje', id);
  }
  res.json({ ok: true });
}));

export default router;

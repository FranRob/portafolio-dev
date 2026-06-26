import { Router, type Request, type Response } from 'express';
import { requireAuth, csrfProtection } from '../../middleware/auth.js';
import { listServices, findBySlug, createService, updateService, deleteService } from './services.service.js';
import { createServiceSchema, updateServiceSchema, idSchema, slugParamSchema } from './services.validator.js';
import { asyncHandler } from '../../lib/errorMiddleware.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';

const router = Router();

// GET /api/services — public list (content excluded)
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const services = await listServices();
  res.json(services);
}));

// GET /api/services/:slug — public detail (content included)
// CRITICAL: must be registered BEFORE /:id to avoid slug being captured as UUID param
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const slugParsed = slugParamSchema.safeParse(req.params['slug']);
  if (!slugParsed.success) {
    res.status(404).json({ message: 'Servicio no encontrado' });
    return;
  }
  const service = await findBySlug(slugParsed.data);
  if (!service) {
    res.status(404).json({ message: 'Servicio no encontrado' });
    return;
  }
  res.json(service);
}));

// CSRF + Auth for admin write operations
router.use(csrfProtection, requireAuth);

// POST /api/services — protected
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = createServiceSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }
  const service = await createService(parsed.data);
  res.status(201).json(service);
}));

// PATCH /api/services/:id — protected
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const idParsed = idSchema.safeParse(req.params['id']);
  if (!idParsed.success) {
    throw new ValidationError(idParsed.error.issues[0].message);
  }
  const parsed = updateServiceSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }
  const service = await updateService(idParsed.data, parsed.data);
  if (!service) {
    throw new NotFoundError('Servicio', idParsed.data);
  }
  res.json(service);
}));

// DELETE /api/services/:id — protected
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const idParsed = idSchema.safeParse(req.params['id']);
  if (!idParsed.success) {
    throw new ValidationError(idParsed.error.issues[0].message);
  }
  const service = await deleteService(idParsed.data);
  if (!service) {
    throw new NotFoundError('Servicio', idParsed.data);
  }
  res.json({ ok: true });
}));

export default router;

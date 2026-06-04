import { Router, type Request, type Response } from 'express';
import { requireAuth, csrfProtection } from '../../middleware/auth.js';
import { listProjects, createProject, updateProject, deleteProject } from './projects.service.js';
import { createProjectSchema, updateProjectSchema, idSchema } from './projects.validator.js';
import { asyncHandler } from '../../lib/errorMiddleware.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';

const router = Router();

// GET /api/projects — public
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const projects = await listProjects();
  res.json(projects);
}));

// CSRF + Auth for admin write operations
router.use(csrfProtection, requireAuth);

// POST /api/projects — protected
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }
  const project = await createProject(parsed.data);
  res.status(201).json(project);
}));

// PATCH /api/projects/:id — protected
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const idParsed = idSchema.safeParse(req.params['id']);
  if (!idParsed.success) {
    throw new ValidationError(idParsed.error.issues[0].message);
  }
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }
  const project = await updateProject(idParsed.data, parsed.data);
  if (!project) {
    throw new NotFoundError('Proyecto', idParsed.data);
  }
  res.json(project);
}));

// DELETE /api/projects/:id — protected
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const idParsed = idSchema.safeParse(req.params['id']);
  if (!idParsed.success) {
    throw new ValidationError(idParsed.error.issues[0].message);
  }
  const project = await deleteProject(idParsed.data);
  if (!project) {
    throw new NotFoundError('Proyecto', idParsed.data);
  }
  res.json({ ok: true });
}));

export default router;

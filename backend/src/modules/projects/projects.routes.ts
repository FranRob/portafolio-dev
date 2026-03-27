import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { listProjects, createProject, updateProject, deleteProject } from './projects.service.js';
import { createProjectSchema, updateProjectSchema, idSchema } from './projects.validator.js';

const router = Router();

// GET /api/projects — public
router.get('/', async (_req: Request, res: Response) => {
  const projects = await listProjects();
  res.json(projects);
});

// POST /api/projects — protected
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }
  const project = await createProject(parsed.data);
  res.status(201).json(project);
});

// PATCH /api/projects/:id — protected
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const idParsed = idSchema.safeParse(req.params['id']);
  if (!idParsed.success) {
    res.status(400).json({ error: 'Invalid project id' });
    return;
  }
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }
  try {
    const project = await updateProject(idParsed.data, parsed.data);
    res.json(project);
  } catch {
    res.status(404).json({ error: 'Project not found' });
  }
});

// DELETE /api/projects/:id — protected
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const idParsed = idSchema.safeParse(req.params['id']);
  if (!idParsed.success) {
    res.status(400).json({ error: 'Invalid project id' });
    return;
  }
  try {
    await deleteProject(idParsed.data);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Project not found' });
  }
});

export default router;

import { Router } from 'express';
import { createFolderHandler, createProjectHandler, getProjectsForUserHandler, } from './projects.controller';
import { authMiddleware } from '../../middlewares/authMiddlewares';

const router = Router();

// This will handle POST requests to /api/projects/
router.post('/', authMiddleware, createProjectHandler);
router.get('/', authMiddleware, getProjectsForUserHandler);
router.post('/:projectId/folders', authMiddleware, createFolderHandler);

export default router;
import express from 'express';
import { body, param } from 'express-validator';
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeProjectMember,
  updateProject
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const mongoId = (field) => param(field).isMongoId().withMessage(`${field} must be a valid id`);

router.use(protect);

router
  .route('/')
  .get(listProjects)
  .post(
    authorize('Admin'),
    [
      body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters'),
      body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description is too long'),
      body('members').optional().isArray().withMessage('Members must be an array'),
      body('members.*').optional().isMongoId().withMessage('Each member must be a valid id')
    ],
    validate,
    createProject
  );

router
  .route('/:id')
  .get(mongoId('id'), validate, getProject)
  .put(
    authorize('Admin'),
    [
      mongoId('id'),
      body('name').optional().trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters'),
      body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description is too long'),
      body('members').optional().isArray().withMessage('Members must be an array'),
      body('members.*').optional().isMongoId().withMessage('Each member must be a valid id')
    ],
    validate,
    updateProject
  )
  .delete(authorize('Admin'), mongoId('id'), validate, deleteProject);

router.post(
  '/:id/members',
  authorize('Admin'),
  [mongoId('id'), body('userId').isMongoId().withMessage('User id must be valid')],
  validate,
  addProjectMember
);

router.delete(
  '/:id/members/:userId',
  authorize('Admin'),
  [mongoId('id'), param('userId').isMongoId().withMessage('User id must be valid')],
  validate,
  removeProjectMember
);

export default router;

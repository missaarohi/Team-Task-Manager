import express from 'express';
import { body, param } from 'express-validator';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const mongoId = (field) => param(field).isMongoId().withMessage(`${field} must be a valid id`);
const statusRule = body('status').isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status is invalid');
const taskValidation = [
  body('title').trim().isLength({ min: 2 }).withMessage('Task title must be at least 2 characters'),
  body('description').optional().trim().isLength({ max: 1500 }).withMessage('Description is too long'),
  body('project').isMongoId().withMessage('Project id must be valid'),
  body('assignedTo').isMongoId().withMessage('Assigned user id must be valid'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status is invalid'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority is invalid'),
  body('dueDate').isISO8601().withMessage('Due date is required')
];

router.use(protect);

router
  .route('/')
  .get(listTasks)
  .post(authorize('Admin'), taskValidation, validate, createTask);

router
  .route('/:id')
  .get(mongoId('id'), validate, getTask)
  .put(authorize('Admin'), [mongoId('id'), ...taskValidation], validate, updateTask)
  .delete(authorize('Admin'), mongoId('id'), validate, deleteTask);

router.patch('/:id/status', [mongoId('id'), statusRule], validate, updateTaskStatus);

export default router;

import express from 'express';
import { listUsers } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('Admin'), listUsers);

export default router;

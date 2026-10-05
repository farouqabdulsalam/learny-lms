import { Router } from 'express';
import { protect, requireActiveRole, requireRole } from '../middleware/auth.js';
import { overview, reviewCourse, markNotificationsRead } from '../controllers/adminController.js';
const router = Router();
router.use(protect, requireRole('admin'), requireActiveRole('admin'));
router.get('/overview', overview);
router.post('/courses/:id/review', reviewCourse);
router.post('/notifications/read', markNotificationsRead);
export default router;

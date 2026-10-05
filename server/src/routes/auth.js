import { Router } from 'express';
import { loginRateLimit } from '../middleware/rateLimit.js';
import {
  login,
  register,
  me,
  switchRole,
  becomeInstructor
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginRateLimit, login);
router.get('/me', protect, me);
router.post('/switch-role', protect, switchRole);
router.post('/become-instructor', protect, becomeInstructor);

export default router;

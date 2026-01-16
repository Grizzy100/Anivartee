import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();
const authController = new AuthController();

router.post('/signup', authLimiter, (req, res) => authController.signup(req, res));
router.post('/signin', authLimiter, (req, res) => authController.signin(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/forgot-password', authLimiter, (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', authLimiter, (req, res) => authController.resetPassword(req, res));

export default router;

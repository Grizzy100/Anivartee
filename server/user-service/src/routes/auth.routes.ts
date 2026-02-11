//server\user-service\src\routes\auth.routes.ts
import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { env } from '../config/env.js';
import { validate } from "../middlewares/validate.middleware.js";
import { signUpSchema } from "../validators/signUpSchema.js";

const router = Router();
const authController = new AuthController();

router.post(
  "/signup",
  authLimiter,
  validate(signUpSchema), 
  (req, res) => authController.signup(req, res)
);
router.post('/signin', authLimiter, (req, res) => authController.signin(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/forgot-password', authLimiter, (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', authLimiter, (req, res) => authController.resetPassword(req, res));

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${env.FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=no_user`);
    }
    const user = req.user as any;
    // In a real app, generate JWT token and redirect with token
    // For now, just redirect to dashboard
    res.redirect(`${env.FRONTEND_URL}/dashboard?userId=${user.id}`);
  }
);

export default router;

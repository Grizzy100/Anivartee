//server\user-service\src\routes\profile.routes.ts
import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';

const router = Router();
const profileController = new ProfileController();

router.get('/me', authenticate, (req, res) =>
  profileController.getProfile(req as AuthRequest, res)
);
router.patch('/me', authenticate, (req, res) =>
  profileController.updateProfile(req as AuthRequest, res)
);
router.post('/me/avatar/signature', authenticate, (req, res) =>
  profileController.getAvatarUploadSignature(req as AuthRequest, res)
);
router.put('/me/avatar', authenticate, (req, res) =>
  profileController.updateAvatar(req as AuthRequest, res)
);

export default router;

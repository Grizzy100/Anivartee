import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const profileController = new ProfileController();

router.get('/me', authenticate, (req, res) => profileController.getProfile(req, res));
router.patch('/me', authenticate, (req, res) => profileController.updateProfile(req, res));
router.post('/me/avatar/signature', authenticate, (req, res) => 
  profileController.getAvatarUploadSignature(req, res)
);
router.put('/me/avatar', authenticate, (req, res) => profileController.updateAvatar(req, res));

export default router;

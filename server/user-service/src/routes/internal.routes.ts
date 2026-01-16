import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { verifyInternalToken } from '../middlewares/internalAuth.middleware.js';

const router = Router();
const profileController = new ProfileController();

router.get('/users/:userId', verifyInternalToken, (req, res) => 
  profileController.getUserById(req, res)
);

export default router;

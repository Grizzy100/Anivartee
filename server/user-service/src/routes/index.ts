import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import internalRoutes from './internal.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'user-service',
    timestamp: new Date().toISOString() 
  });
});

router.use('/auth', authRoutes);
router.use('/', profileRoutes);
router.use('/internal', internalRoutes);

export default router;

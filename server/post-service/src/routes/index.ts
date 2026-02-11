//server\post-service\src\routes\index.ts
import { Router } from 'express';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import interactionRoutes from './interaction.routes.js';
import flagRoutes from './flag.routes.js';
import factCheckRoutes from './factCheck.routes.js';
import feedRoutes from './feed.routes.js';
import activityRoutes from './activity.routes.js';
import queueRoutes from './queue.routes.js';
import verdictRoutes from './verdict.routes.js';
import internalRoutes from './internal.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Public/authenticated routes
router.use('/posts', postRoutes);
router.use('/', commentRoutes);
router.use('/', interactionRoutes);
router.use('/', flagRoutes);
router.use('/', factCheckRoutes);
router.use('/feed', feedRoutes);
router.use('/activity', activityRoutes);

// Moderation routes (fact-checker workflow)
router.use('/moderation/queue', queueRoutes);
router.use('/moderation', verdictRoutes);

// Internal routes (for other services)
router.use('/internal', internalRoutes);

export default router;
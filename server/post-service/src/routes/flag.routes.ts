//server\post-service\src\routes\flag.routes.ts
import { Router } from 'express';
import { FlagController } from '../controllers/flag.controller.js';
import { FlagService } from '../services/flag.service.js';
import { FlagRepository } from '../repositories/flag.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const flagRepo = new FlagRepository();
const postRepo = new PostRepository();
const pointsClient = new PointsClient();
const flagService = new FlagService(flagRepo, postRepo, pointsClient);
const flagController = new FlagController(flagService);

// Routes
router.post('/posts/:linkId/flag', authenticate, asyncHandler((req, res) => 
  flagController.flagPost(req, res)
));
router.delete('/posts/:linkId/flag', authenticate, asyncHandler((req, res) => 
  flagController.unflagPost(req, res)
));
router.get('/posts/:linkId/flag-score', asyncHandler((req, res) => 
  flagController.getFlagScore(req, res)
));

export default router;
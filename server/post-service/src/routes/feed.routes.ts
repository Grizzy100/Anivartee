//server\post-service\src\routes\feed.routes.ts
import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller.js';
import { FeedService } from '../services/feed.service.js';
import { FeedRepository } from '../repositories/feed.repository.js';
import { UserClient } from '../services/clients/user.client.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const feedRepo = new FeedRepository();
const userClient = new UserClient();
const feedService = new FeedService(feedRepo, userClient);
const feedController = new FeedController(feedService);

// Routes
router.get('/', optionalAuth, asyncHandler((req, res) => 
  feedController.getHomeFeed(req, res)
));
router.get('/trending', asyncHandler((req, res) => 
  feedController.getTrendingFeed(req, res)
));
router.get('/controversial', asyncHandler((req, res) => 
  feedController.getControversialFeed(req, res)
));

export default router;
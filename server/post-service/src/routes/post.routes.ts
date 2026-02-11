//server\post-service\src\routes\post.routes.ts
import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { PostService } from '../services/post.service.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { QueueService } from '../services/queue.service.js';
import { QueueRepository } from '../repositories/queue.repository.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const postRepo = new PostRepository();
const pointsClient = new PointsClient();
const queueRepo = new QueueRepository();
const queueService = new QueueService(queueRepo);
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);
const postService = new PostService(postRepo, pointsClient, queueService, activityService);
const postController = new PostController(postService);

// Routes
router.post('/', authenticate, asyncHandler((req, res) => postController.createPost(req, res)));
router.get('/user/:userId', asyncHandler((req, res) => postController.getUserPosts(req, res)));
router.get('/:id', optionalAuth, asyncHandler((req, res) => postController.getPost(req, res)));
router.patch('/:id', authenticate, asyncHandler((req, res) => postController.updatePost(req, res)));
router.delete('/:id', authenticate, asyncHandler((req, res) => postController.deletePost(req, res)));

export default router;
//server\post-service\src\routes\comment.routes.ts
import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { CommentService } from '../services/comment.service.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const commentRepo = new CommentRepository();
const postRepo = new PostRepository();
const pointsClient = new PointsClient();
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);
const commentService = new CommentService(commentRepo, postRepo, pointsClient, activityService);
const commentController = new CommentController(commentService);

// Routes
router.post('/posts/:linkId/comments', authenticate, asyncHandler((req, res) => 
  commentController.createComment(req, res)
));
router.get('/posts/:linkId/comments', asyncHandler((req, res) => 
  commentController.getComments(req, res)
));
router.patch('/comments/:id', authenticate, asyncHandler((req, res) => 
  commentController.updateComment(req, res)
));
router.delete('/comments/:id', authenticate, asyncHandler((req, res) => 
  commentController.deleteComment(req, res)
));

export default router;
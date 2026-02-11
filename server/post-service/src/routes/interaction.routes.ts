//server\post-service\src\routes\interaction.routes.ts
import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller.js';
import { InteractionService } from '../services/interaction.service.js';
import { InteractionRepository } from '../repositories/interaction.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { FlagRepository } from '../repositories/flag.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const interactionRepo = new InteractionRepository();
const postRepo = new PostRepository();
const commentRepo = new CommentRepository();
const flagRepo = new FlagRepository();
const pointsClient = new PointsClient();
const interactionService = new InteractionService(
  interactionRepo,
  postRepo,
  commentRepo,
  flagRepo,
  pointsClient
);
const interactionController = new InteractionController(interactionService);

// Post likes
router.post('/posts/:linkId/like', authenticate, asyncHandler((req, res) => 
  interactionController.likePost(req, res)
));
router.delete('/posts/:linkId/like', authenticate, asyncHandler((req, res) => 
  interactionController.unlikePost(req, res)
));

// Comment likes
router.post('/comments/:commentId/like', authenticate, asyncHandler((req, res) => 
  interactionController.likeComment(req, res)
));
router.delete('/comments/:commentId/like', authenticate, asyncHandler((req, res) => 
  interactionController.unlikeComment(req, res)
));

// Saves
router.post('/posts/:linkId/save', authenticate, asyncHandler((req, res) => 
  interactionController.savePost(req, res)
));
router.delete('/posts/:linkId/save', authenticate, asyncHandler((req, res) => 
  interactionController.unsavePost(req, res)
));
router.get('/saved', authenticate, asyncHandler((req, res) => 
  interactionController.getSavedPosts(req, res)
));

// Views
router.post('/posts/:linkId/view', optionalAuth, asyncHandler((req, res) => 
  interactionController.trackView(req, res)
));

// Shares
router.post('/posts/:linkId/share', authenticate, asyncHandler((req, res) => 
  interactionController.sharePost(req, res)
));

export default router;
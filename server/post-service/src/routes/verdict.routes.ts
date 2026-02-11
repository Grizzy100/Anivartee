import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller.js';
import { VerdictController } from '../controllers/verdict.controller.js';
import { ClaimService } from '../services/claim.service.js';
import { VerdictService } from '../services/verdict.service.js';
import { QueueService } from '../services/queue.service.js';
import { QueueRepository } from '../repositories/queue.repository.js';
import { ClaimRepository } from '../repositories/claim.repository.js';
import { DraftRepository } from '../repositories/draft.repository.js';
import { FactCheckRepository } from '../repositories/factCheck.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const queueRepo = new QueueRepository();
const claimRepo = new ClaimRepository();
const draftRepo = new DraftRepository();
const factCheckRepo = new FactCheckRepository();
const postRepo = new PostRepository();
const pointsClient = new PointsClient();
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);

const queueService = new QueueService(queueRepo);
const claimService = new ClaimService(claimRepo, queueService, pointsClient);
const verdictService = new VerdictService(
  claimService,
  queueService,
  draftRepo,
  factCheckRepo,
  postRepo,
  pointsClient,
  activityService
);

const claimController = new ClaimController(claimService);
const verdictController = new VerdictController(verdictService);

// ─── Claim endpoints ────────────────────────────────────────
// POST /api/moderation/posts/:postId/claim — Claim a post for review
router.post(
  '/posts/:postId/claim',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => claimController.claimPost(req, res))
);

// DELETE /api/moderation/posts/:postId/claim — Abandon a claim
router.delete(
  '/posts/:postId/claim',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => claimController.abandonClaim(req, res))
);

// GET /api/moderation/posts/:postId/claim — Get active claim info
router.get(
  '/posts/:postId/claim',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => claimController.getActiveClaim(req, res))
);

// ─── Verdict endpoints ──────────────────────────────────────
// POST /api/moderation/posts/:postId/verdict — Submit a verdict
router.post(
  '/posts/:postId/verdict',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => verdictController.submitVerdict(req, res))
);

// ─── Draft endpoints ────────────────────────────────────────
// PUT /api/moderation/posts/:postId/draft — Auto-save draft
router.put(
  '/posts/:postId/draft',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => verdictController.saveDraft(req, res))
);

// GET /api/moderation/posts/:postId/draft — Get saved draft
router.get(
  '/posts/:postId/draft',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => verdictController.getDraft(req, res))
);

export default router;

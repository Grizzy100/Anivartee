//server\post-service\src\repositories\claim.repository.ts
import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { ClaimStatus } from '../generated/prisma/index.js';

const CLAIM_TIMEOUT_MINUTES = 30;

export class ClaimRepository {
  async create(queueId: string, postId: string, factCheckerId: string) {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CLAIM_TIMEOUT_MINUTES * 60 * 1000);

      return await prisma.claimRecord.create({
        data: {
          queueId,
          postId,
          factCheckerId,
          expiresAt
        }
      });
    } catch (error) {
      logger.error('Database error in claim.create:', error);
      throw new DatabaseError('Failed to create claim');
    }
  }

  async findActiveClaim(postId: string, factCheckerId: string) {
    try {
      return await prisma.claimRecord.findFirst({
        where: {
          postId,
          factCheckerId,
          status: 'ACTIVE'
        }
      });
    } catch (error) {
      logger.error('Database error in claim.findActiveClaim:', error);
      throw new DatabaseError('Failed to find active claim');
    }
  }

  async findActiveClaimByPost(postId: string) {
    try {
      return await prisma.claimRecord.findFirst({
        where: {
          postId,
          status: 'ACTIVE'
        }
      });
    } catch (error) {
      logger.error('Database error in claim.findActiveClaimByPost:', error);
      throw new DatabaseError('Failed to find active claim for post');
    }
  }

  async getClaimsToday(factCheckerId: string): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      return await prisma.claimRecord.count({
        where: {
          factCheckerId,
          claimedAt: { gte: startOfDay }
        }
      });
    } catch (error) {
      logger.error('Database error in claim.getClaimsToday:', error);
      throw new DatabaseError('Failed to count today claims');
    }
  }

  async updateStatus(id: string, status: ClaimStatus) {
    try {
      return await prisma.claimRecord.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      logger.error('Database error in claim.updateStatus:', error);
      throw new DatabaseError('Failed to update claim status');
    }
  }

  async findExpiredClaims() {
    try {
      return await prisma.claimRecord.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lt: new Date() }
        }
      });
    } catch (error) {
      logger.error('Database error in claim.findExpiredClaims:', error);
      throw new DatabaseError('Failed to find expired claims');
    }
  }

  async deleteByPostId(postId: string) {
    try {
      await prisma.claimRecord.deleteMany({ where: { postId } });
    } catch (error) {
      logger.error('Database error in claim.deleteByPostId:', error);
      throw new DatabaseError('Failed to delete claims by post');
    }
  }
}

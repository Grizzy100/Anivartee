import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class DraftRepository {
  async upsert(
    postId: string,
    factCheckerId: string,
    data: {
      verdict?: string;
      header?: string;
      description?: string;
      referenceUrls?: string[];
    }
  ) {
    try {
      return await prisma.factCheckDraft.upsert({
        where: {
          postId_factCheckerId: { postId, factCheckerId }
        },
        create: {
          postId,
          factCheckerId,
          ...data
        },
        update: {
          ...data,
          lastSavedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Database error in draft.upsert:', error);
      throw new DatabaseError('Failed to save draft');
    }
  }

  async findByPostAndChecker(postId: string, factCheckerId: string) {
    try {
      return await prisma.factCheckDraft.findUnique({
        where: {
          postId_factCheckerId: { postId, factCheckerId }
        }
      });
    } catch (error) {
      logger.error('Database error in draft.findByPostAndChecker:', error);
      throw new DatabaseError('Failed to find draft');
    }
  }

  async deleteByPostAndChecker(postId: string, factCheckerId: string) {
    try {
      const existing = await prisma.factCheckDraft.findUnique({
        where: { postId_factCheckerId: { postId, factCheckerId } }
      });
      if (!existing) return;

      await prisma.factCheckDraft.delete({
        where: { postId_factCheckerId: { postId, factCheckerId } }
      });
    } catch (error) {
      logger.error('Database error in draft.deleteByPostAndChecker:', error);
      throw new DatabaseError('Failed to delete draft');
    }
  }

  async deleteByPost(postId: string) {
    try {
      await prisma.factCheckDraft.deleteMany({ where: { postId } });
    } catch (error) {
      logger.error('Database error in draft.deleteByPost:', error);
      throw new DatabaseError('Failed to delete drafts for post');
    }
  }
}

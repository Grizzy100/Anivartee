//server\user-service\src\services\profile.service.ts
import prisma from '../utils/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { generateUploadSignature, deleteImage } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';
import type { UpdateProfileInput } from '../validators/updateProfileSchema.js';
import type { UpdateAvatarInput } from '../validators/updateAvatarSchema.js';

export class ProfileService {
  async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          emailVerified: true,
          createdAt: true,
          userProfile: {
            select: {
              firstName: true,
              lastName: true,
              state: true,
              country: true
            }
          },
          factCheckerProfile: {
            select: {
              firstName: true,
              lastName: true,
              organization: true,
              verifiedAt: true
            }
          }
        }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, userProfile: true, factCheckerProfile: true }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            displayName: data.displayName,
            bio: data.bio
          }
        });

        if (user.role === 'USER' && user.userProfile) {
          await tx.userProfile.update({
            where: { userId },
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              state: data.state,
              country: data.country
            }
          });
        }

        if (user.role === 'FACT_CHECKER' && user.factCheckerProfile) {
          await tx.factCheckerProfile.update({
            where: { userId },
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              organization: data.organization
            }
          });
        }
      });

      logger.info(`Profile updated for user: ${userId}`);

      return this.getProfile(userId);
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async getAvatarUploadSignature(userId: string) {
    try {
      const publicId = `user_${userId}_${Date.now()}`;
      const signature = generateUploadSignature(publicId);

      logger.debug(`Avatar upload signature generated for user: ${userId}`);

      return signature;
    } catch (error) {
      logger.error('Get avatar signature error:', error);
      throw error;
    }
  }

  async updateAvatar(userId: string, data: UpdateAvatarInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarPublicId: true }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.avatarPublicId) {
        await deleteImage(user.avatarPublicId);
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: data.avatarUrl,
          avatarPublicId: data.avatarPublicId
        }
      });

      logger.info(`Avatar updated for user: ${userId}`);

      return { avatarUrl: data.avatarUrl };
    } catch (error) {
      logger.error('Update avatar error:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          role: true,
          status: true,
          avatarUrl: true
        }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }
}

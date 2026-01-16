import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service.js';
import { updateProfileSchema } from '../validators/updateProfileSchema.js';
import { updateAvatarSchema } from '../validators/updateAvatarSchema.js';
import { logger } from '../utils/logger.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await profileService.getProfile(userId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      logger.error('Get profile controller error:', error);
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get profile'
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedProfile = await profileService.updateProfile(userId, validatedData);
      
      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error: any) {
      logger.error('Update profile controller error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update profile'
      });
    }
  }

  async getAvatarUploadSignature(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const signature = await profileService.getAvatarUploadSignature(userId);
      
      res.json({
        success: true,
        data: signature
      });
    } catch (error: any) {
      logger.error('Get avatar signature controller error:', error);
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to generate upload signature'
      });
    }
  }

  async updateAvatar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const validatedData = updateAvatarSchema.parse(req.body);
      const result = await profileService.updateAvatar(userId, validatedData);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Update avatar controller error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update avatar'
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      // Fix: Handle string array from params
      const userId = Array.isArray(req.params.userId) 
        ? req.params.userId[0] 
        : req.params.userId;
      
      const user = await profileService.getUserById(userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      logger.error('Get user by ID controller error:', error);
      
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get user'
      });
    }
  }
}

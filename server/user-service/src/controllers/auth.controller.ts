//server\user-service\src\controllers\auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { loginSchema } from '../validators/loginSchema.js';
import { forgotPasswordSchema } from '../validators/forgotPasswordSchema.js';
import { resetPasswordSchema } from '../validators/resetPasswordSchema.js';
import { logger } from '../utils/logger.js';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      // ✅ body already validated by validate(signUpSchema) middleware
      const result = await authService.signup(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error: any) {
      logger.error('Signup controller error:', error);

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Signup failed',
      });
    }
  }

  async signin(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.signin(validatedData);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error: any) {
      logger.error('Signin controller error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Signin failed',
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'No refresh token provided',
        });
      }

      const result = await authService.refresh(refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      logger.error('Refresh controller error:', error);

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Token refresh failed',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout controller error:', error);

      res.clearCookie('refreshToken');

      res.status(500).json({
        success: false,
        error: error.message || 'Logout failed',
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(validatedData.email);

      res.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent',
      });
    } catch (error: any) {
      logger.error('Forgot password controller error:', error);

      res.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent',
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(validatedData);

      res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error: any) {
      logger.error('Reset password controller error:', error);

      res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || 'Password reset failed',
      });
    }
  }
}

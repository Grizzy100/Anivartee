//server\user-service\src\services\auth.service.ts
import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { generateTokens } from '../utils/jwt.js';
import { EmailService } from './email.service.js';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from '../utils/errors.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import type { SignUpInput } from '../validators/signUpSchema.js';
import type { LoginInput } from '../validators/loginSchema.js';
import type { ResetPasswordInput } from '../validators/resetPasswordSchema.js';

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Register a new user
   * Uses DB constraints to prevent race conditions
   */
  async signup(data: SignUpInput) {

    const allowedRoles = ['USER', 'FACT_CHECKER'] as const;
    if (!allowedRoles.includes(data.role)) {
      throw new ValidationError('Invalid role selected');
    }
    try {
      const passwordHash = await hashPassword(data.password);

      // Let database handle uniqueness - prevents race conditions
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email.toLowerCase(),
            username: data.username.toLowerCase(),
            passwordHash,
            role: data.role,
            emailVerified: false,
            ...(data.image && { avatarUrl: data.image }),
            ...(data.role === 'USER' && {
              userProfile: { create: {} },
            }),
            ...(data.role === 'FACT_CHECKER' && {
              factCheckerProfile: { create: {} },
            }),
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
          },
        });

        return newUser;
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        role: user.role,
      });

      // Store refresh token hash
      const refreshTokenHash = hashToken(refreshToken);
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash,
          expiresAt: new Date(
            Date.now() + CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
          ),
        },
      });

      logger.info('User signed up', { userId: user.id, email: user.email });

      // Send welcome email (non-blocking)
      this.emailService
        .sendWelcomeEmail(user.email, user.username, user.role)
        .catch((err: any) => logger.error('Welcome email send error:', err));

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error: any) {
      // Handle Prisma unique constraint violations
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          throw new ConflictError('Email already in use');
        } else if (field === 'username') {
          throw new ConflictError('Username already taken');
        }
        throw new ConflictError('This account already exists');
      }

      logger.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user and create session
   */
  async signin(data: LoginInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (!user) {
        await hashPassword('dummy_password_to_prevent_timing_attack');
        throw new AuthenticationError('Invalid email or password');
      }

      if (user.status === 'DISABLED') {
        throw new AuthenticationError('Account is disabled');
      }

      const isValid = await comparePassword(
        data.password,
        user.passwordHash
      );
      if (!isValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        role: user.role,
      });

      const refreshTokenHash = hashToken(refreshToken);

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash,
          expiresAt: new Date(
            Date.now() + CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
          ),
        },
      });

      logger.info('User signed in', { userId: user.id });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error) {
      logger.error('Signin error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * ✅ Implements optimistic locking with updatedAt to prevent race conditions
   */
  async refresh(refreshToken: string) {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const tokenHash = hashToken(refreshToken);

        const session = await prisma.session.findFirst({
          where: {
            refreshTokenHash: tokenHash,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
        });

        if (!session) {
          throw new AuthenticationError('Invalid or expired refresh token');
        }

        if (session.user.status === 'DISABLED') {
          throw new AuthenticationError('Account is disabled');
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens({
          userId: session.user.id,
          role: session.user.role,
        });

        const newRefreshTokenHash = hashToken(newRefreshToken);

        // ✅ Atomic update with optimistic locking using updatedAt
        const updated = await prisma.session.updateMany({
          where: {
            id: session.id,
            refreshTokenHash: tokenHash, // Ensures this specific token
            updatedAt: session.updatedAt, // ✅ Optimistic lock - fails if session was modified
            revokedAt: null, // Additional safety check
          },
          data: {
            refreshTokenHash: newRefreshTokenHash,
            expiresAt: new Date(
              Date.now() + CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
            ),
          },
        });

        if (updated.count === 0) {
          if (attempt < maxRetries - 1) {
            // Session was modified by another request, retry with exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * Math.pow(2, attempt))
            );
            continue;
          }
          throw new AuthenticationError(
            'Token refresh failed due to concurrent update, please login again'
          );
        }

        logger.debug('Token refreshed', { userId: session.user.id });

        return { accessToken, refreshToken: newRefreshToken };
      } catch (error) {
        if (attempt === maxRetries - 1) {
          logger.error('Refresh token error:', error);
          throw error;
        }
      }
    }

    throw new AuthenticationError('Token refresh failed after retries');
  }

  /**
   * Revoke refresh token (logout)
   */
  async logout(refreshToken: string) {
    try {
      const tokenHash = hashToken(refreshToken);

      await prisma.session.updateMany({
        where: { refreshTokenHash: tokenHash },
        data: { revokedAt: new Date() },
      });

      logger.debug('User logged out');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * Implements timing attack protection
   */
  async forgotPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Timing attack prevention - same delay as success case
        logger.warn('Password reset requested for non-existent email', {
          email,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        return;
      }

      // Invalidate all previous tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });

      const resetToken = generateToken(32);
      const tokenHash = hashToken(resetToken);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(
            Date.now() +
              CONSTANTS.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
          ),
        },
      });

      logger.info('Password reset token generated', { userId: user.id });

      // Send password reset email (non-blocking)
      this.emailService
        .sendPasswordResetEmail(user.email, resetToken, user.username)
        .catch((err: any) => logger.error('Reset email send error:', err));

      return { message: 'Password reset email sent' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(data: ResetPasswordInput) {
    try {
      const tokenHash = hashToken(data.token);

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!resetToken) {
        throw new ValidationError('Invalid or expired reset token');
      }

      const passwordHash = await hashPassword(data.newPassword);

      // Update password, mark token as used, revoke all sessions
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        }),
        prisma.session.updateMany({
          where: { userId: resetToken.userId },
          data: { revokedAt: new Date() },
        }),
      ]);

      logger.info('Password reset', { userId: resetToken.user.id });

      // Send confirmation email (non-blocking)
      this.emailService
        .sendPasswordResetConfirmationEmail(
          resetToken.user.email,
          resetToken.user.username
        )
        .catch((err: any) =>
          logger.error('Confirmation email send error:', err)
        );

      return { message: 'Password reset successful' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }
}
import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { generateTokens } from '../utils/jwt.js';
import { 
  AuthenticationError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import type { SignUpInput } from '../validators/signUpSchema.js';
import type { LoginInput } from '../validators/loginSchema.js';
import type { ResetPasswordInput } from '../validators/resetPasswordSchema.js';

export class AuthService {
  async signup(data: SignUpInput) {
    try {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email.toLowerCase() },
            { username: data.username.toLowerCase() }
          ]
        }
      });

      if (existing) {
        if (existing.email === data.email.toLowerCase()) {
          throw new ConflictError('Email already in use');
        }
        throw new ConflictError('Username already taken');
      }

      const passwordHash = await hashPassword(data.password);

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email.toLowerCase(),
            username: data.username,
            passwordHash,
            role: data.role,
            emailVerified: false,
            ...(data.image && { avatarUrl: data.image }),
            ...(data.role === 'USER' && { userProfile: { create: {} } }),
            ...(data.role === 'FACT_CHECKER' && { factCheckerProfile: { create: {} } })
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
            avatarUrl: true,
            createdAt: true
          }
        });

        return newUser;
      });

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        role: user.role
      });

      const refreshTokenHash = hashToken(refreshToken);
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash,
          expiresAt: new Date(Date.now() + CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        }
      });

      logger.info(`User signed up: ${user.email}`);

      return { 
        accessToken, 
        refreshToken, 
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      };
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  async signin(data: LoginInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      if (user.status === 'DISABLED') {
        throw new AuthenticationError('Account is disabled');
      }

      const isValid = await comparePassword(data.password, user.passwordHash);
      if (!isValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        role: user.role
      });

      const refreshTokenHash = hashToken(refreshToken);
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash,
          expiresAt: new Date(Date.now() + CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        }
      });

      logger.info(`User signed in: ${user.email}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      };
    } catch (error) {
      logger.error('Signin error:', error);
      throw error;
    }
  }

  async refresh(refreshToken: string) {
    try {
      const tokenHash = hashToken(refreshToken);

      const session = await prisma.session.findFirst({
        where: {
          refreshTokenHash: tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!session) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      if (session.user.status === 'DISABLED') {
        throw new AuthenticationError('Account is disabled');
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens({
        userId: session.user.id,
        role: session.user.role
      });

      const newRefreshTokenHash = hashToken(newRefreshToken);
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: new Date(Date.now() + CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        }
      });

      logger.debug(`Token refreshed for user: ${session.user.email}`);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      const tokenHash = hashToken(refreshToken);
      
      await prisma.session.updateMany({
        where: { refreshTokenHash: tokenHash },
        data: { revokedAt: new Date() }
      });

      logger.debug('User logged out');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        return;
      }

      const resetToken = generateToken(32);
      const tokenHash = hashToken(resetToken);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + CONSTANTS.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        }
      });

      logger.info(`Password reset token generated for: ${user.email}`);
      logger.debug(`Reset token: ${resetToken}`);

      return { message: 'Password reset email sent' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordInput) {
    try {
      const tokenHash = hashToken(data.token);

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!resetToken) {
        throw new ValidationError('Invalid or expired reset token');
      }

      const passwordHash = await hashPassword(data.newPassword);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash }
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() }
        }),
        prisma.session.updateMany({
          where: { userId: resetToken.userId },
          data: { revokedAt: new Date() }
        })
      ]);

      logger.info(`Password reset for user: ${resetToken.user.email}`);

      return { message: 'Password reset successful' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }
}

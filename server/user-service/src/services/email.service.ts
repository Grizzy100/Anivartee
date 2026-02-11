//server\user-service\src\services\email.service.ts
import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async sendWelcomeEmail(email: string, username: string, role: string): Promise<void> {
    try {
      const roleText = role === 'FACT_CHECKER' ? 'Fact Checker' : 'User';
      const html = this.welcomeTemplate(username, roleText);
      
      await resend.emails.send({
        from: 'Anivartee <noreply@anivartee.com>',
        to: email,
        subject: `Welcome to Anivartee, ${username}!`,
        html
      });
      
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw - email failure shouldn't block signup
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, username: string): Promise<void> {
    try {
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const html = this.passwordResetTemplate(username, resetUrl);
      
      await resend.emails.send({
        from: 'Anivartee <noreply@anivartee.com>',
        to: email,
        subject: 'Reset Your Anivartee Password',
        html
      });
      
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
    }
  }

  async sendPasswordResetConfirmationEmail(email: string, username: string): Promise<void> {
    try {
      const html = this.passwordResetConfirmationTemplate(username);
      
      await resend.emails.send({
        from: 'Anivartee <noreply@anivartee.com>',
        to: email,
        subject: 'Password Reset Successfully',
        html
      });
      
      logger.info(`Password reset confirmation email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset confirmation email:', error);
    }
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string, username: string): Promise<void> {
    try {
      const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const html = this.emailVerificationTemplate(username, verifyUrl);
      
      await resend.emails.send({
        from: 'Anivartee <noreply@anivartee.com>',
        to: email,
        subject: 'Verify Your Anivartee Email',
        html
      });
      
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
    }
  }

  // Email templates
  private welcomeTemplate(username: string, role: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Anivartee! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${username},</p>
              <p>You have successfully signed up for Anivartee as a <strong>${role}</strong>!</p>
              <p>We're excited to have you on board. You can now:</p>
              <ul>
                <li>Share and discover fact-checked content</li>
                <li>Build your reputation with accurate information</li>
                <li>Connect with other fact-checkers and users</li>
              </ul>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy fact-checking!</p>
              <p><strong>The Anivartee Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Anivartee. All rights reserved.</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private passwordResetTemplate(username: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
            .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${username},</p>
              <p>We received a request to reset your Anivartee password. Click the button below to set a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2026 Anivartee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private passwordResetConfirmationTemplate(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
            .success { background: #d4edda; padding: 10px; border-left: 4px solid #28a745; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful ✓</h1>
            </div>
            <div class="content">
              <p>Hi ${username},</p>
              <p>Your password has been successfully reset.</p>
              <div class="success">
                <strong>✓ Success:</strong> You can now log in with your new password.
              </div>
              <p>If you did not make this change or have any concerns about your account security, please contact our support team immediately.</p>
              <p><strong>The Anivartee Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Anivartee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private emailVerificationTemplate(username: string, verifyUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email Address</h1>
            </div>
            <div class="content">
              <p>Hi ${username},</p>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <a href="${verifyUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 3px;">${verifyUrl}</p>
              <p>This link expires in 24 hours.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Anivartee. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

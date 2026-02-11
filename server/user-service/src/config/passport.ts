import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import prisma from '../utils/prisma.js'; // ✅ FIX: Use the configured prisma instance

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || '', // ✅ FIX: Add fallback for optional config
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: env.GOOGLE_CALLBACK_URL || ''
    },
    async (accessToken: any, refreshToken: any, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email from Google'));
        }

        // Find or create OAuth account
        let user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          // Create new user with Google OAuth
          user = await prisma.user.create({
            data: {
              email,
              username: profile.displayName.replace(/\s+/g, '').toLowerCase() || `user_${Date.now()}`, // ✅ FIX: Add fallback
              passwordHash: '', // ✅ FIX: Required field for User model
              role: 'USER',
              emailVerified: true, // Google verified email
              avatarUrl: picture, // ✅ FIX: Changed from 'avatar' to 'avatarUrl'
              oauthAccounts: {
                create: {
                  provider: 'google',
                  providerAccountId: googleId,
                  email,
                  name,
                  picture,
                  accessToken,
                  refreshToken,
                  expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour
                }
              },
              userProfile: { // ✅ FIX: Create UserProfile for consistency
                create: {}
              }
            },
            include: { oauthAccounts: true }
          });
        } else {
          // Link OAuth account if not already linked
          const existingOAuth = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId: googleId
              }
            }
          });

          if (!existingOAuth) {
            await prisma.oAuthAccount.create({
              data: {
                userId: user.id,
                provider: 'google',
                providerAccountId: googleId,
                email,
                name,
                picture,
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 3600 * 1000)
              }
            });
          } else {
            // Update tokens
            await prisma.oAuthAccount.update({
              where: {
                provider_providerAccountId: {
                  provider: 'google',
                  providerAccountId: googleId
                }
              },
              data: {
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 3600 * 1000)
              }
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);



export default passport;
//server\user-service\src\config\constants.ts
export const CONSTANTS = {
  // Password hashing
  BCRYPT_ROUNDS: 12,

  // Password validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Session management
  SESSION_EXPIRY_DAYS: 7,

  // Token expiry
  RESET_TOKEN_EXPIRY_HOURS: 1,
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX_ATTEMPTS: 5,
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,

  // Cloudinary
  CLOUDINARY_FOLDER: 'anivartee/avatars',
  MAX_AVATAR_SIZE_MB: 5,

  // Username
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 32,
  RESERVED_USERNAMES: [
    'admin',
    'root',
    'system',
    'support',
    'help',
    'api',
    'www',
    'mail',
    'moderator',
    'anivartee',
    'administrator',
    'mod',
    'staff',
  ] as const,

  // Email
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 255,

  // Connection pool (for Prisma v7 adapter)
  DB_POOL_MAX: 10,
  DB_CONNECTION_TIMEOUT_MS: 5000,
  DB_IDLE_TIMEOUT_MS: 30000,

  // Request timeouts
  REQUEST_TIMEOUT_MS: 30000,

  // Common passwords to block
  COMMON_PASSWORDS: [
    'Password123!',
    'Welcome123!',
    'Admin123!',
    'User123!',
    'Test123!',
  ] as const,
} as const;

export type ReservedUsername = (typeof CONSTANTS.RESERVED_USERNAMES)[number];
export type CommonPassword = (typeof CONSTANTS.COMMON_PASSWORDS)[number];

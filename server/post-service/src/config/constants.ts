//server\post-service\src\config\constants.ts
export const CONSTANTS = {
  // Post limits
  POST_TITLE_MIN_LENGTH: 1,
  POST_TITLE_MAX_LENGTH: 150,
  POST_DESCRIPTION_MAX_LENGTH: 400,
  POST_URL_MAX_LENGTH: 2048,
  
  // Comment limits
  COMMENT_MIN_LENGTH: 1,
  COMMENT_MAX_LENGTH: 500,
  
  // Fact-check limits
  FACT_CHECK_HEADER_MIN_LENGTH: 6,
  FACT_CHECK_DESCRIPTION_MIN_LENGTH: 10,
  FACT_CHECK_MAX_SOURCES: 3,
  
  // Feed pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // View tracking
  VIEW_SESSION_DURATION_HOURS: 24,
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Cloudinary
  CLOUDINARY_FOLDER: 'post-recordings',
  MAX_RECORDING_SIZE_MB: 50
} as const;
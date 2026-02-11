//server\post-service\src\services\clients\user.client.ts
import httpClient from '../../utils/http.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  avatarUrl?: string;
}

/** Max parallel HTTP calls to user-service when fetching many users. */
const CONCURRENCY_LIMIT = 5;

export class UserClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.USER_SERVICE_URL;
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const response = await httpClient.get(
        `${this.baseUrl}/api/internal/users/${userId}`
      );
      return response.data.data;
    } catch (error: any) {
      logger.error(`Failed to fetch user ${userId}:`, error.message);
      // Graceful degradation: return minimal user data
      return {
        id: userId,
        username: 'Unknown User',
        role: 'USER'
      };
    }
  }

  /**
   * Fetch multiple users with deduplication and bounded concurrency.
   * Fires at most CONCURRENCY_LIMIT requests in parallel to avoid
   * overwhelming the user-service on large feed pages.
   */
  async getUsersByIds(userIds: string[]): Promise<Map<string, UserProfile>> {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return new Map();

    const userMap = new Map<string, UserProfile>();

    // Process in batches of CONCURRENCY_LIMIT
    for (let i = 0; i < uniqueIds.length; i += CONCURRENCY_LIMIT) {
      const batch = uniqueIds.slice(i, i + CONCURRENCY_LIMIT);
      const results = await Promise.all(
        batch.map(id => this.getUserById(id))
      );
      for (const user of results) {
        if (user) userMap.set(user.id, user);
      }
    }

    return userMap;
  }
}
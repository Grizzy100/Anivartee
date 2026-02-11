import httpClient from '../../utils/http.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

interface UserData {
  id: string;
  role: string;
  status: string;
}

export class UserClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.USER_SERVICE_URL;
  }

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const response = await httpClient.get(
        `${this.baseUrl}/api/internal/users/${userId}`
      );
      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to fetch user from user-service:', error.message);
      return null;
    }
  }
}

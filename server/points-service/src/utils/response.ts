import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/api.types.js';

export class ResponseUtil {
  static success<T>(res: Response, data: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      code
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    total: number,
    statusCode: number = 200
  ): Response {
    const response: PaginatedResponse<T> = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
    return res.status(statusCode).json({ success: true, ...response });
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

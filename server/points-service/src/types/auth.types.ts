import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface RankLimits {
  maxHeaderLength: number;
  maxDescriptionLength: number;
  postsPerDay: number;
  flagsPerDay: number;
  postPoints: number;
  flagWeight: number;
}

export interface UserRankData {
  userId: string;
  role: 'USER' | 'FACT_CHECKER' | 'ADMIN';
  rankLevel: number;
  rankName: string;
  points: number;
  limits: RankLimits;
}

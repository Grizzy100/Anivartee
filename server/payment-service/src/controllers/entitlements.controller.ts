import { Request, Response } from 'express';
import { EntitlementsService } from '../services/entitlements.service.js';
import { ResponseUtil } from '../utils/response.js';

export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) { }

  async getUserEntitlements(req: Request, res: Response) {
    const { userId } = req.params;
    const entitlements = await this.entitlementsService.getEntitlementsForUser(
      userId as string
    );

    return ResponseUtil.success(res, entitlements);
  }
}


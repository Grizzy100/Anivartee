//server\user-service\src\types\express.d.ts
import { JWTPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

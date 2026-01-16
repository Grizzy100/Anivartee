//server\user-service\src\utils\hash.ts
import bcrypt from 'bcrypt';
import { CONSTANTS } from '../config/constants.js';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, CONSTANTS.BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

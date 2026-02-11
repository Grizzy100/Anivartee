import { ValidationError } from './errors.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getParam(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export function getOptionalParam(param: string | string[] | undefined): string | undefined {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
}

/** Extract a route param and validate it as a UUID. */
export function getUuidParam(param: string | string[]): string {
  const value = getParam(param);
  if (!UUID_RE.test(value)) {
    throw new ValidationError(`Invalid UUID parameter: ${value}`);
  }
  return value;
}

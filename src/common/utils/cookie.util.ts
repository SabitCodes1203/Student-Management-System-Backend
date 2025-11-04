import { Request } from 'express';

export const AUTH_COOKIE_NAME = process.env.APP_COOKIE_NAME || 'auth_token';

export const cookieJwtExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies[AUTH_COOKIE_NAME] || null;
  }
  return null;
};


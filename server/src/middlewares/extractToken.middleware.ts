import { Request } from 'express';

export const extractToken = (req: Request): string | null => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1] || null;
  }
  return (req.cookies?.accessToken as string) || null;
};

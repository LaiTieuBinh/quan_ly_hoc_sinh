import { Request } from 'express';

export function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;
  for (const entry of cookieHeader.split(';')) {
    const [key, ...parts] = entry.trim().split('=');
    if (key === name) return decodeURIComponent(parts.join('='));
  }
  return undefined;
}

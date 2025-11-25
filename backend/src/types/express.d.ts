/**
 * TypeScript declarations for Express Request with session
 */

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    csrfSecret?: string;
    userId?: string;
    [key: string]: unknown;
  }
}

declare module 'express' {
  interface Request {
    session?: session.Session & Partial<session.SessionData>;
  }
}


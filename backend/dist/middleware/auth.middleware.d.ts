import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
/**
 * Middleware to authenticate requests using JWT
 * Verifies the access token and attaches user info to request
 */
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to authorize based on user roles
 * Must be used after authenticate middleware
 */
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export declare const optionalAuthenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map
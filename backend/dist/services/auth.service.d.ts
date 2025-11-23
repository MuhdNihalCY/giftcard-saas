import { UserRole } from '@prisma/client';
export interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    role?: UserRole;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}
export declare class AuthService {
    register(data: RegisterData): Promise<{
        message: string;
        accessToken: never;
        refreshToken: never;
        user: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            businessName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            isEmailVerified: boolean;
            createdAt: Date;
        };
    }>;
    login(data: LoginData): Promise<{
        accessToken: never;
        refreshToken: never;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            businessName: string | null;
            isEmailVerified: boolean;
        };
    }>;
    generateTokens(payload: TokenPayload): {
        accessToken: never;
        refreshToken: never;
    };
    verifyToken(token: string, isRefresh?: boolean): TokenPayload;
    refreshToken(refreshToken: string): Promise<{
        accessToken: never;
        refreshToken: never;
    }>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map
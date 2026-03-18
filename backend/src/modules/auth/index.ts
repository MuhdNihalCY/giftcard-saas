// modules/auth/index.ts — public API for the auth module
export { AuthService } from '../../services/auth.service';
export { AuthRepository } from './auth.repository';

export type { RegisterData, LoginData, TokenPayload } from '../../services/auth.service';

import authService from '../../services/auth.service';
export { authService };

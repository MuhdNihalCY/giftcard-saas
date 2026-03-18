// modules/users/index.ts — public API for the users module
export { UserRepository } from './user.repository';

import { UserRepository } from './user.repository';
export const userRepository = new UserRepository();

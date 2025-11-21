import { AuthService } from '../../src/services/auth.service';
import prisma from '../../src/config/database';
import { ValidationError, UnauthorizedError } from '../../src/utils/errors';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: 'CUSTOMER',
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const result = await authService.register(registerData);

      expect(result.user.email).toBe(registerData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'Test123!@#',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: registerData.email,
      });

      await expect(authService.register(registerData)).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: loginData.email,
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
        businessName: null,
        isEmailVerified: true,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await authService.login(loginData);

      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: loginData.email,
        passwordHash: hashedPassword,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test123!@#',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error if account is locked', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: loginData.email,
        isActive: true,
        failedLoginAttempts: 5,
        lockedUntil,
      });

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });
});


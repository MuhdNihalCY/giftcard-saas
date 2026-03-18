import prisma from '../../infrastructure/database';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findActiveUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    role?: string;
    isEmailVerified?: boolean;
  }) {
    return prisma.user.create({
      data: data as any,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        businessName: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  }

  async updateUserLoginAttempts(userId: string, attempts: number, lockedUntil?: Date | null) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        ...(lockedUntil !== undefined && { lockedUntil }),
      },
    });
  }

  async resetUserLoginAttempts(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    token: string;
    deviceName?: string;
    deviceType?: string;
    userAgent?: string;
    ipAddress?: string;
    lastUsedAt: Date;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data: data as any });
  }

  async findRefreshToken(id: string) {
    return prisma.refreshToken.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async updateRefreshTokenLastUsed(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { lastUsedAt: new Date() } });
  }
}

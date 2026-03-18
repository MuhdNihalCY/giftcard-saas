import prisma from '../../infrastructure/database';

export class NotificationRepository {
  // OTP operations
  async deleteExpiredOTPs(identifier: string, type: string) {
    return prisma.oTP.deleteMany({
      where: { identifier, type, used: false, expiresAt: { gt: new Date() } },
    });
  }

  async createOTP(data: {
    userId?: string;
    identifier: string;
    code: string;
    type: string;
    expiresAt: Date;
    metadata?: Record<string, any>;
  }) {
    return prisma.oTP.create({ data: { ...data, metadata: data.metadata || {} } });
  }

  async findOTP(identifier: string, code: string, type: string, userId?: string) {
    return prisma.oTP.findFirst({
      where: {
        identifier,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
        ...(userId && { userId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementOTPAttempts(identifier: string, type: string) {
    return prisma.oTP.updateMany({
      where: { identifier, type, used: false },
      data: { attempts: { increment: 1 } },
    });
  }

  async markOTPUsed(id: string) {
    return prisma.oTP.update({ where: { id }, data: { used: true } });
  }

  async countRecentOTPs(identifier: string, type: string, since: Date) {
    return prisma.oTP.count({
      where: { identifier, type, createdAt: { gte: since } },
    });
  }

  // Email verification operations
  async deleteEmailVerificationTokens(userId: string) {
    return prisma.emailVerificationToken.deleteMany({ where: { userId } });
  }

  async createEmailVerificationToken(userId: string, token: string, expiresAt: Date) {
    return prisma.emailVerificationToken.create({ data: { userId, token, expiresAt } });
  }

  async findEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteEmailVerificationToken(id: string) {
    return prisma.emailVerificationToken.delete({ where: { id } });
  }

  async markUserEmailVerified(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  // Password reset operations
  async deletePasswordResetTokens(userId: string) {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deletePasswordResetToken(id: string) {
    return prisma.passwordResetToken.delete({ where: { id } });
  }

  async markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({ where: { id }, data: { used: true } });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    });
  }
}

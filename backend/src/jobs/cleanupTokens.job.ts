import { Job } from 'bullmq';
import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Clean up expired tokens
 */
export async function processCleanupTokens(job: Job) {
  try {
    const now = new Date();

    // Clean up expired email verification tokens
    const deletedEmailTokens = await prisma.emailVerificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Clean up expired password reset tokens
    const deletedPasswordTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    logger.info('Token cleanup completed', {
      emailTokens: deletedEmailTokens.count,
      passwordTokens: deletedPasswordTokens.count,
    });

    return {
      emailTokens: deletedEmailTokens.count,
      passwordTokens: deletedPasswordTokens.count,
    };
  } catch (error: any) {
    logger.error('Error cleaning up tokens', { error: error.message });
    throw error;
  }
}



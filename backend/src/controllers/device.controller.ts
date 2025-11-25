/**
 * Device Management Controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export class DeviceController {
  /**
   * List all user's devices
   * GET /auth/devices
   */
  async listDevices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const devices = await prisma.refreshToken.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          lastUsedAt: 'desc',
        },
        select: {
          id: true,
          deviceName: true,
          deviceType: true,
          userAgent: true,
          ipAddress: true,
          lastUsedAt: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          devices,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke a specific device
   * DELETE /auth/devices/:deviceId
   */
  async revokeDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { deviceId } = req.params;

      const device = await prisma.refreshToken.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new NotFoundError('Device not found');
      }

      await prisma.refreshToken.update({
        where: { id: deviceId },
        data: { revokedAt: new Date() },
      });

      logger.info('Device revoked', { userId, deviceId });

      res.json({
        success: true,
        message: 'Device revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke all devices (logout from all devices)
   * DELETE /auth/devices
   */
  async revokeAllDevices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      logger.info('All devices revoked', { userId, count: result.count });

      res.json({
        success: true,
        data: {
          revokedCount: result.count,
        },
        message: 'All devices revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeviceController();


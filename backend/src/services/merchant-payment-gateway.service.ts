import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { GatewayType, VerificationStatus } from '@prisma/client';
import logger from '../utils/logger';
import { encryptSensitiveData, decryptSensitiveData } from '../utils/encryption';

export interface GatewayCredentials {
  apiKey?: string;
  secretKey?: string;
  publishableKey?: string;
  clientId?: string;
  clientSecret?: string;
  keyId?: string;
  keySecret?: string;
  connectAccountId?: string;
  [key: string]: any; // Allow additional fields
}

export interface CreateGatewayConfigData {
  merchantId: string;
  gatewayType: GatewayType;
  credentials: GatewayCredentials;
  connectAccountId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateGatewayConfigData {
  credentials?: GatewayCredentials;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export class MerchantPaymentGatewayService {
  /**
   * Create or update payment gateway configuration for a merchant
   */
  async createGatewayConfig(data: CreateGatewayConfigData) {
    const { merchantId, gatewayType, credentials, connectAccountId, metadata } = data;

    // Verify merchant exists and is a merchant
    const merchant = await prisma.user.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    if (merchant.role !== 'MERCHANT' && merchant.role !== 'ADMIN') {
      throw new ValidationError('User must be a merchant or admin');
    }

    // Encrypt credentials
    const encryptedCredentials = encryptSensitiveData(credentials);

    // Check if gateway already exists for this merchant
    const existing = await prisma.merchantPaymentGateway.findUnique({
      where: {
        merchantId_gatewayType: {
          merchantId,
          gatewayType,
        },
      },
    });

    if (existing) {
      // Update existing gateway
      const updated = await prisma.merchantPaymentGateway.update({
        where: { id: existing.id },
        data: {
          credentials: encryptedCredentials,
          connectAccountId: connectAccountId || existing.connectAccountId,
          verificationStatus: VerificationStatus.PENDING,
          metadata: metadata || existing.metadata,
          updatedAt: new Date(),
        },
      });

      logger.info('Payment gateway configuration updated', {
        merchantId,
        gatewayType,
        gatewayId: updated.id,
      });

      return updated;
    }

    // Create new gateway configuration
    const gateway = await prisma.merchantPaymentGateway.create({
      data: {
        merchantId,
        gatewayType,
        credentials: encryptedCredentials,
        connectAccountId: connectAccountId || null,
        verificationStatus: VerificationStatus.PENDING,
        isActive: false, // Must be verified before activation
        metadata: metadata || {},
      },
    });

    logger.info('Payment gateway configuration created', {
      merchantId,
      gatewayType,
      gatewayId: gateway.id,
    });

    return gateway;
  }

  /**
   * Update gateway configuration
   */
  async updateGatewayConfig(id: string, merchantId: string, data: UpdateGatewayConfigData) {
    const gateway = await prisma.merchantPaymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new NotFoundError('Payment gateway configuration not found');
    }

    if (gateway.merchantId !== merchantId) {
      throw new ValidationError('Unauthorized: Gateway does not belong to merchant');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.credentials) {
      updateData.credentials = encryptSensitiveData(data.credentials);
      updateData.verificationStatus = VerificationStatus.PENDING; // Require re-verification
      updateData.isActive = false; // Deactivate until verified
    }

    if (data.isActive !== undefined) {
      // Only allow activation if verified
      if (data.isActive && gateway.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new ValidationError('Cannot activate unverified gateway');
      }
      updateData.isActive = data.isActive;
    }

    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const updated = await prisma.merchantPaymentGateway.update({
      where: { id },
      data: updateData,
    });

    logger.info('Payment gateway configuration updated', {
      gatewayId: id,
      merchantId,
    });

    return updated;
  }

  /**
   * Get active payment gateways for a merchant
   */
  async getActiveGateways(merchantId: string) {
    const gateways = await prisma.merchantPaymentGateway.findMany({
      where: {
        merchantId,
        isActive: true,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      select: {
        id: true,
        gatewayType: true,
        isActive: true,
        connectAccountId: true,
        verificationStatus: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        // Do not return encrypted credentials
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return gateways;
  }

  /**
   * Get all payment gateways for a merchant (including inactive)
   */
  async getAllGateways(merchantId: string) {
    const gateways = await prisma.merchantPaymentGateway.findMany({
      where: {
        merchantId,
      },
      select: {
        id: true,
        gatewayType: true,
        isActive: true,
        connectAccountId: true,
        verificationStatus: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return gateways;
  }

  /**
   * Get gateway by ID (with credentials for internal use)
   */
  async getGatewayById(id: string, merchantId?: string) {
    const gateway = await prisma.merchantPaymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new NotFoundError('Payment gateway configuration not found');
    }

    if (merchantId && gateway.merchantId !== merchantId) {
      throw new ValidationError('Unauthorized: Gateway does not belong to merchant');
    }

    return gateway;
  }

  /**
   * Get gateway by merchant and type (with decrypted credentials for internal use)
   */
  async getGatewayForMerchant(merchantId: string, gatewayType: GatewayType) {
    const gateway = await prisma.merchantPaymentGateway.findUnique({
      where: {
        merchantId_gatewayType: {
          merchantId,
          gatewayType,
        },
      },
    });

    if (!gateway) {
      return null;
    }

    // Decrypt credentials for internal use
    try {
      const decryptedCredentials = decryptSensitiveData(gateway.credentials);
      return {
        ...gateway,
        credentials: decryptedCredentials,
      };
    } catch (error: any) {
      logger.error('Failed to decrypt gateway credentials', {
        gatewayId: gateway.id,
        error: error.message,
      });
      throw new ValidationError('Failed to decrypt gateway credentials');
    }
  }

  /**
   * Verify gateway connection
   */
  async verifyGateway(merchantId: string, gatewayType: GatewayType): Promise<boolean> {
    const gateway = await this.getGatewayForMerchant(merchantId, gatewayType);

    if (!gateway) {
      throw new NotFoundError('Payment gateway configuration not found');
    }

    // Basic verification - check if credentials are present
    // Actual verification should be done by the specific gateway service
    const credentials = gateway.credentials as GatewayCredentials;
    
    let isValid = false;
    switch (gatewayType) {
      case GatewayType.STRIPE:
        isValid = !!(credentials.secretKey || credentials.connectAccountId);
        break;
      case GatewayType.PAYPAL:
        isValid = !!(credentials.clientId && credentials.clientSecret);
        break;
      case GatewayType.RAZORPAY:
        isValid = !!(credentials.keyId && credentials.keySecret);
        break;
      default:
        isValid = false;
    }

    // Update verification status
    await prisma.merchantPaymentGateway.update({
      where: { id: gateway.id },
      data: {
        verificationStatus: isValid ? VerificationStatus.VERIFIED : VerificationStatus.FAILED,
      },
    });

    return isValid;
  }

  /**
   * Mark gateway as verified
   */
  async markAsVerified(id: string, merchantId: string) {
    const gateway = await this.getGatewayById(id, merchantId);

    const updated = await prisma.merchantPaymentGateway.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        isActive: true, // Auto-activate when verified
      },
    });

    logger.info('Payment gateway marked as verified', {
      gatewayId: id,
      merchantId,
    });

    return updated;
  }

  /**
   * Deactivate gateway
   */
  async deactivateGateway(id: string, merchantId: string) {
    const gateway = await this.getGatewayById(id, merchantId);

    const updated = await prisma.merchantPaymentGateway.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    logger.info('Payment gateway deactivated', {
      gatewayId: id,
      merchantId,
    });

    return updated;
  }

  /**
   * Delete gateway configuration
   */
  async deleteGateway(id: string, merchantId: string) {
    const gateway = await this.getGatewayById(id, merchantId);

    await prisma.merchantPaymentGateway.delete({
      where: { id },
    });

    logger.info('Payment gateway configuration deleted', {
      gatewayId: id,
      merchantId,
    });
  }
}

export default new MerchantPaymentGatewayService();


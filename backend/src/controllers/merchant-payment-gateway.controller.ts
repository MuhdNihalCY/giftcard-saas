import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import merchantPaymentGatewayService from '../services/merchant-payment-gateway.service';
import stripeConnectService from '../services/payment/stripe-connect.service';
import paypalConnectService from '../services/payment/paypal-connect.service';
import { GatewayType } from '@prisma/client';
import { env } from '../config/env';

export class MerchantPaymentGatewayController {
  /**
   * Create Stripe Connect account
   */
  async createStripeConnectAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { email, country, type } = req.body;

      const result = await stripeConnectService.createConnectAccount({
        merchantId,
        email,
        country,
        type,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Stripe Connect account created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Stripe Connect account link for onboarding
   */
  async getStripeConnectLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.STRIPE
      );

      if (!gateway || !gateway.connectAccountId) {
        return res.status(404).json({
          success: false,
          message: 'Stripe Connect account not found. Please create one first.',
        });
      }

      const returnUrl = req.query.returnUrl as string || `${env.FRONTEND_URL}/dashboard/settings/payment-gateways?stripe=success`;
      const refreshUrl = req.query.refreshUrl as string || `${env.FRONTEND_URL}/dashboard/settings/payment-gateways?stripe=refresh`;
      const type = (req.query.type as string) || 'account_onboarding';

      const accountLink = await stripeConnectService.getConnectAccountLink({
        accountId: gateway.connectAccountId,
        returnUrl,
        refreshUrl,
        type: type as 'account_onboarding' | 'account_update',
      });

      res.json({
        success: true,
        data: accountLink,
        message: 'Stripe Connect account link generated',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create PayPal account connection
   */
  async createPayPalAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { gatewayType, credentials, metadata } = req.body;

      if (gatewayType !== 'PAYPAL') {
        return res.status(400).json({
          success: false,
          message: 'This endpoint is for PayPal accounts only',
        });
      }

      const result = await paypalConnectService.createMerchantAccount({
        merchantId,
        clientId: credentials?.clientId,
        clientSecret: credentials?.clientSecret,
        mode: credentials?.mode || 'sandbox',
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'PayPal account connected successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List merchant payment gateways
   */
  async listGateways(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const activeOnly = req.query.active === 'true';
      const gateways = activeOnly
        ? await merchantPaymentGatewayService.getActiveGateways(merchantId)
        : await merchantPaymentGatewayService.getAllGateways(merchantId);

      res.json({
        success: true,
        data: gateways,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gateway by ID
   */
  async getGateway(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const gateway = await merchantPaymentGatewayService.getGatewayById(id, merchantId);

      // Remove credentials from response
      const { credentials, ...gatewayData } = gateway;
      const responseData = {
        ...gatewayData,
        hasCredentials: !!credentials,
      };

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update gateway configuration
   */
  async updateGateway(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { credentials, isActive, metadata } = req.body;

      const updated = await merchantPaymentGatewayService.updateGatewayConfig(id, merchantId, {
        credentials,
        isActive,
        metadata,
      });

      // Remove credentials from response
      const { credentials: _, ...gatewayData } = updated;
      const responseData = {
        ...gatewayData,
        hasCredentials: !!updated.credentials,
      };

      res.json({
        success: true,
        data: responseData,
        message: 'Gateway configuration updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify gateway
   */
  async verifyGateway(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const gateway = await merchantPaymentGatewayService.getGatewayById(id, merchantId);

      let verified = false;

      if (gateway.gatewayType === GatewayType.STRIPE && gateway.connectAccountId) {
        // Verify Stripe Connect account
        const accountInfo = await stripeConnectService.verifyConnectAccount(gateway.connectAccountId);
        verified = accountInfo.chargesEnabled && accountInfo.payoutsEnabled;

        if (verified) {
          await merchantPaymentGatewayService.markAsVerified(id, merchantId);
        }
      } else if (gateway.gatewayType === GatewayType.PAYPAL) {
        // Verify PayPal account
        verified = await paypalConnectService.verifyMerchantAccount(merchantId);

        if (verified) {
          await merchantPaymentGatewayService.markAsVerified(id, merchantId);
        }
      } else {
        // Basic verification for other gateways
        verified = await merchantPaymentGatewayService.verifyGateway(
          merchantId,
          gateway.gatewayType
        );
      }

      res.json({
        success: true,
        data: {
          verified,
          gatewayId: id,
        },
        message: verified
          ? 'Gateway verified successfully'
          : 'Gateway verification failed',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate gateway
   */
  async deactivateGateway(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const gateway = await merchantPaymentGatewayService.deactivateGateway(id, merchantId);

      res.json({
        success: true,
        data: gateway,
        message: 'Gateway deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete gateway
   */
  async deleteGateway(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      await merchantPaymentGatewayService.deleteGateway(id, merchantId);

      res.json({
        success: true,
        message: 'Gateway deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MerchantPaymentGatewayController();







import axios from 'axios';
import { ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';
import merchantPaymentGatewayService from '../merchant-payment-gateway.service';
import { GatewayType } from '@prisma/client';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface CreateMerchantAccountData {
  merchantId: string;
  clientId: string;
  clientSecret: string;
  mode?: 'live' | 'sandbox';
}

export interface CreateOrderForMerchantData {
  merchantId: string;
  amount: number;
  currency: string;
  giftCardId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayoutToMerchantData {
  merchantId: string;
  amount: number;
  currency: string;
  email?: string; // PayPal email or merchant account ID
}

export class PayPalConnectService {
  /**
   * Get PayPal API base URL based on mode
   */
  private getBaseUrl(mode: 'live' | 'sandbox' = 'sandbox'): string {
    return mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Get access token for merchant's PayPal account
   */
  private async getMerchantAccessToken(
    clientId: string,
    clientSecret: string,
    mode: 'live' | 'sandbox' = 'sandbox'
  ): Promise<string> {
    try {
      const baseUrl = this.getBaseUrl(mode);
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await axios.post<PayPalAccessToken>(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      logger.error('PayPal authentication error', {
        error: error.message,
        mode,
      });
      throw new ValidationError(`PayPal authentication error: ${error.message}`);
    }
  }

  /**
   * Create or link merchant PayPal account
   */
  async createMerchantAccount(data: CreateMerchantAccountData) {
    const { merchantId, clientId, clientSecret, mode = 'sandbox' } = data;

    try {
      // Test credentials by getting access token
      const accessToken = await this.getMerchantAccessToken(clientId, clientSecret, mode);

      // Get merchant info to verify account
      const baseUrl = this.getBaseUrl(mode);
      const merchantInfoResponse = await axios.get(
        `${baseUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const merchantInfo = merchantInfoResponse.data;

      // Store credentials in merchant gateway
      await merchantPaymentGatewayService.createGatewayConfig({
        merchantId,
        gatewayType: GatewayType.PAYPAL,
        credentials: {
          clientId,
          clientSecret,
          mode,
        },
        metadata: {
          email: merchantInfo.email,
          verified: merchantInfo.verified_account,
          payerId: merchantInfo.user_id,
        },
      });

      logger.info('PayPal merchant account linked', {
        merchantId,
        email: merchantInfo.email,
        mode,
      });

      return {
        email: merchantInfo.email,
        verified: merchantInfo.verified_account,
        payerId: merchantInfo.user_id,
        mode,
      };
    } catch (error: any) {
      logger.error('Failed to link PayPal merchant account', {
        merchantId,
        error: error.message,
      });
      throw new ValidationError(`Failed to link PayPal account: ${error.message}`);
    }
  }

  /**
   * Verify merchant PayPal account
   */
  async verifyMerchantAccount(merchantId: string): Promise<boolean> {
    try {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.PAYPAL
      );

      if (!gateway || !gateway.isActive) {
        return false;
      }

      const credentials = gateway.credentials as any;
      const mode = credentials.mode || 'sandbox';

      // Test by getting access token
      await this.getMerchantAccessToken(
        credentials.clientId,
        credentials.clientSecret,
        mode
      );

      return true;
    } catch (error: any) {
      logger.error('PayPal account verification failed', {
        merchantId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Create PayPal order using merchant's account
   */
  async createOrderForMerchant(data: CreateOrderForMerchantData) {
    const { merchantId, amount, currency, giftCardId, returnUrl, cancelUrl } = data;

    try {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.PAYPAL
      );

      if (!gateway || !gateway.isActive) {
        throw new ValidationError('Merchant does not have an active PayPal account');
      }

      const credentials = gateway.credentials as any;
      const mode = credentials.mode || 'sandbox';
      const baseUrl = this.getBaseUrl(mode);
      const accessToken = await this.getMerchantAccessToken(
        credentials.clientId,
        credentials.clientSecret,
        mode
      );

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: giftCardId,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      const response = await axios.post(
        `${baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('PayPal order created for merchant', {
        merchantId,
        orderId: response.data.id,
        amount,
      });

      return {
        orderId: response.data.id,
        status: response.data.status,
        links: response.data.links,
      };
    } catch (error: any) {
      logger.error('Failed to create PayPal order for merchant', {
        merchantId,
        error: error.message,
      });
      throw new ValidationError(`Failed to create PayPal order: ${error.message}`);
    }
  }

  /**
   * Capture PayPal order
   */
  async captureOrder(merchantId: string, orderId: string) {
    try {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.PAYPAL
      );

      if (!gateway || !gateway.isActive) {
        throw new ValidationError('Merchant does not have an active PayPal account');
      }

      const credentials = gateway.credentials as any;
      const mode = credentials.mode || 'sandbox';
      const baseUrl = this.getBaseUrl(mode);
      const accessToken = await this.getMerchantAccessToken(
        credentials.clientId,
        credentials.clientSecret,
        mode
      );

      const response = await axios.post(
        `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const capture = response.data.purchase_units[0].payments.captures[0];

      return {
        orderId: response.data.id,
        status: response.data.status,
        transactionId: capture.id,
        amount: parseFloat(capture.amount.value),
        currency: capture.amount.currency_code,
      };
    } catch (error: any) {
      logger.error('Failed to capture PayPal order', {
        merchantId,
        orderId,
        error: error.message,
      });
      throw new ValidationError(`Failed to capture PayPal order: ${error.message}`);
    }
  }

  /**
   * Send payout to merchant's PayPal account
   */
  async payoutToMerchant(data: PayoutToMerchantData) {
    const { merchantId, amount, currency, email } = data;

    try {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.PAYPAL
      );

      if (!gateway || !gateway.isActive) {
        throw new ValidationError('Merchant does not have an active PayPal account');
      }

      const credentials = gateway.credentials as any;
      const mode = credentials.mode || 'sandbox';
      const baseUrl = this.getBaseUrl(mode);
      const accessToken = await this.getMerchantAccessToken(
        credentials.clientId,
        credentials.clientSecret,
        mode
      );

      // Get merchant email from metadata or use provided email
      const merchantEmail = email || gateway.metadata?.email;

      if (!merchantEmail) {
        throw new ValidationError('Merchant PayPal email is required for payout');
      }

      const payoutData = {
        sender_batch_header: {
          sender_batch_id: `payout_${merchantId}_${Date.now()}`,
          email_subject: 'Gift Card SaaS Payout',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: amount.toFixed(2),
              currency: currency,
            },
            receiver: merchantEmail,
            note: 'Gift card redemption payout',
          },
        ],
      };

      const response = await axios.post(
        `${baseUrl}/v1/payments/payouts`,
        payoutData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('PayPal payout created for merchant', {
        merchantId,
        payoutBatchId: response.data.batch_header.payout_batch_id,
        amount,
      });

      return {
        payoutBatchId: response.data.batch_header.payout_batch_id,
        status: response.data.batch_header.batch_status,
        amount: amount,
        currency: currency,
      };
    } catch (error: any) {
      logger.error('Failed to create PayPal payout', {
        merchantId,
        error: error.message,
      });
      throw new ValidationError(`Failed to create PayPal payout: ${error.message}`);
    }
  }

  /**
   * Get payout status
   */
  async getPayoutStatus(merchantId: string, payoutBatchId: string) {
    try {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.PAYPAL
      );

      if (!gateway || !gateway.isActive) {
        throw new ValidationError('Merchant does not have an active PayPal account');
      }

      const credentials = gateway.credentials as any;
      const mode = credentials.mode || 'sandbox';
      const baseUrl = this.getBaseUrl(mode);
      const accessToken = await this.getMerchantAccessToken(
        credentials.clientId,
        credentials.clientSecret,
        mode
      );

      const response = await axios.get(
        `${baseUrl}/v1/payments/payouts/${payoutBatchId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        payoutBatchId: response.data.batch_header.payout_batch_id,
        status: response.data.batch_header.batch_status,
        amount: response.data.batch_header.amount?.value
          ? parseFloat(response.data.batch_header.amount.value)
          : 0,
        currency: response.data.batch_header.amount?.currency_code || 'USD',
      };
    } catch (error: any) {
      logger.error('Failed to get PayPal payout status', {
        merchantId,
        payoutBatchId,
        error: error.message,
      });
      throw new ValidationError(`Failed to get payout status: ${error.message}`);
    }
  }
}

export default new PayPalConnectService();







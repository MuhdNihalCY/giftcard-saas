import axios from 'axios';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface CreatePayPalOrderData {
  amount: number;
  currency: string;
  giftCardId: string;
  returnUrl: string;
  cancelUrl: string;
}

export class PayPalService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    this.clientId = env.PAYPAL_CLIENT_ID;
    this.clientSecret = env.PAYPAL_SECRET;
  }

  /**
   * Get access token
   */
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post<PayPalAccessToken>(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      throw new ValidationError(`PayPal authentication error: ${error.message}`);
    }
  }

  /**
   * Create PayPal order
   */
  async createOrder(data: CreatePayPalOrderData) {
    const { amount, currency, giftCardId, returnUrl, cancelUrl } = data;

    try {
      const accessToken = await this.getAccessToken();

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
        `${this.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        orderId: response.data.id,
        status: response.data.status,
        links: response.data.links,
      };
    } catch (error: any) {
      throw new ValidationError(`PayPal order creation error: ${error.message}`);
    }
  }

  /**
   * Capture PayPal order
   */
  async captureOrder(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
      throw new ValidationError(`PayPal capture error: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        amount: parseFloat(response.data.purchase_units[0].amount.value),
        currency: response.data.purchase_units[0].amount.currency_code,
      };
    } catch (error: any) {
      throw new ValidationError(`PayPal order retrieval error: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  async refundPayment(captureId: string, amount?: number) {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount) {
        refundData.amount = {
          value: amount.toFixed(2),
          currency_code: 'USD', // Should be dynamic based on original payment
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        refundData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        refundId: response.data.id,
        status: response.data.status,
        amount: parseFloat(response.data.amount?.value || '0'),
      };
    } catch (error: any) {
      throw new ValidationError(`PayPal refund error: ${error.message}`);
    }
  }
}

export default new PayPalService();


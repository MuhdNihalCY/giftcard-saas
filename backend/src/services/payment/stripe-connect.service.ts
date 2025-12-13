import Stripe from 'stripe';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';
import merchantPaymentGatewayService from '../merchant-payment-gateway.service';
import { GatewayType } from '@prisma/client';

// Platform Stripe instance (for managing Connect accounts)
// Only create if STRIPE_SECRET_KEY is configured
let platformStripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY) {
  try {
    platformStripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  } catch (error: any) {
    logger.error('Failed to initialize Stripe', { error: error.message });
    platformStripe = null;
  }
}

export interface CreateConnectAccountData {
  merchantId: string;
  email?: string;
  country?: string;
  type?: 'express' | 'standard';
}

export interface CreateAccountLinkData {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
  type?: 'account_onboarding' | 'account_update';
}

export interface CreatePaymentIntentForMerchantData {
  merchantId: string;
  amount: number;
  currency: string;
  giftCardId: string;
  customerId?: string;
  applicationFeeAmount?: number; // Platform commission
  metadata?: Record<string, string>;
}

export interface TransferToMerchantData {
  accountId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export class StripeConnectService {
  /**
   * Get Stripe instance for a merchant (using their credentials or Connect account)
   */
  private async getMerchantStripe(merchantId: string, connectAccountId?: string): Promise<Stripe> {
    // If connectAccountId is provided, use Connect account
    if (connectAccountId) {
      if (!platformStripe) {
        throw new ValidationError(
          'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
        );
      }
      return platformStripe; // Use platform key with on_behalf_of parameter
    }

    // Otherwise, try to get merchant's own Stripe credentials
    const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
      merchantId,
      GatewayType.STRIPE
    );

    if (gateway && gateway.isActive) {
      const credentials = gateway.credentials as any;
      if (credentials.secretKey) {
        return new Stripe(credentials.secretKey, {
          apiVersion: '2023-10-16',
        });
      }
    }

    // Fallback to platform Stripe
    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }
    return platformStripe;
  }

  /**
   * Create Stripe Connect account for a merchant
   */
  async createConnectAccount(data: CreateConnectAccountData) {
    const { merchantId, email, country, type = 'express' } = data;

    // Check if Stripe is configured
    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    if (!env.STRIPE_SECRET_KEY) {
      throw new ValidationError(
        'Stripe secret key is not configured. Please contact the administrator.'
      );
    }

    try {
      const accountData: Stripe.AccountCreateParams = {
        type: type === 'express' ? 'express' : 'standard',
        country: country || 'US',
        email: email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          merchantId,
        },
      };

      const account = await platformStripe.accounts.create(accountData);

      logger.info('Stripe Connect account created', {
        merchantId,
        accountId: account.id,
        type,
      });

      // Store connect account ID in merchant gateway
      await merchantPaymentGatewayService.createGatewayConfig({
        merchantId,
        gatewayType: GatewayType.STRIPE,
        credentials: {}, // No credentials needed for Connect
        connectAccountId: account.id,
        metadata: {
          accountType: type,
          country: account.country,
        },
      });

      return {
        accountId: account.id,
        type: account.type,
        country: account.country,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      };
    } catch (error: any) {
      logger.error('Failed to create Stripe Connect account', {
        merchantId,
        error: error.message,
        stripeError: error.type,
        stripeCode: error.code,
      });

      // Provide more helpful error messages
      if (error.type === 'StripeAuthenticationError') {
        throw new ValidationError(
          'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY configuration.'
        );
      } else if (error.type === 'StripeInvalidRequestError') {
        throw new ValidationError(
          `Invalid request to Stripe: ${error.message}. Please check your input parameters.`
        );
      } else if (error.message?.includes('No API key provided')) {
        throw new ValidationError(
          'Stripe API key is missing. Please configure STRIPE_SECRET_KEY in environment variables.'
        );
      }

      throw new ValidationError(
        `Failed to create Stripe Connect account: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get account link for onboarding or updating
   */
  async getConnectAccountLink(data: CreateAccountLinkData) {
    const { accountId, returnUrl, refreshUrl, type = 'account_onboarding' } = data;

    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    try {
      const accountLink = await platformStripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: type as 'account_onboarding' | 'account_update',
      });

      return {
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
      };
    } catch (error: any) {
      logger.error('Failed to create Stripe account link', {
        accountId,
        error: error.message,
      });
      throw new ValidationError(`Failed to create account link: ${error.message}`);
    }
  }

  /**
   * Verify Connect account status
   */
  async verifyConnectAccount(accountId: string) {
    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    try {
      const account = await platformStripe.accounts.retrieve(accountId);

      return {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        email: account.email,
        country: account.country,
        type: account.type,
        capabilities: account.capabilities,
      };
    } catch (error: any) {
      logger.error('Failed to verify Stripe Connect account', {
        accountId,
        error: error.message,
      });
      throw new ValidationError(`Failed to verify account: ${error.message}`);
    }
  }

  /**
   * Create payment intent using merchant's Stripe Connect account
   */
  async createPaymentIntentForMerchant(data: CreatePaymentIntentForMerchantData) {
    const {
      merchantId,
      amount,
      currency,
      giftCardId,
      customerId,
      applicationFeeAmount,
      metadata = {},
    } = data;

    try {
      if (!platformStripe) {
        throw new ValidationError(
          'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
        );
      }

      // Get merchant's Connect account ID
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.STRIPE
      );

      if (!gateway || !gateway.connectAccountId) {
        throw new ValidationError('Merchant does not have a connected Stripe account');
      }

      const connectAccountId = gateway.connectAccountId;

      // Create payment intent on merchant's Connect account
      const paymentIntent = await platformStripe.paymentIntents.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          customer: customerId,
          application_fee_amount: applicationFeeAmount
            ? Math.round(applicationFeeAmount * 100)
            : undefined,
          metadata: {
            giftCardId,
            merchantId,
            ...metadata,
          },
          automatic_payment_methods: {
            enabled: true,
          },
        },
        {
          stripeAccount: connectAccountId,
        }
      );

      logger.info('Payment intent created for merchant', {
        merchantId,
        connectAccountId,
        paymentIntentId: paymentIntent.id,
        amount,
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      };
    } catch (error: any) {
      logger.error('Failed to create payment intent for merchant', {
        merchantId,
        error: error.message,
      });
      throw new ValidationError(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Transfer funds to merchant's Connect account (for payouts)
   */
  async transferToMerchant(data: TransferToMerchantData) {
    const { accountId, amount, currency, metadata = {} } = data;

    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    try {
      const transfer = await platformStripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination: accountId,
        metadata,
      });

      logger.info('Transfer created to merchant', {
        accountId,
        transferId: transfer.id,
        amount,
        currency,
      });

      return {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        status: transfer.reversed ? 'reversed' : 'succeeded',
      };
    } catch (error: any) {
      logger.error('Failed to transfer to merchant', {
        accountId,
        error: error.message,
      });
      throw new ValidationError(`Failed to transfer funds: ${error.message}`);
    }
  }

  /**
   * Get account balance for merchant's Connect account
   */
  async getAccountBalance(accountId: string) {
    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    try {
      const balance = await platformStripe.balance.retrieve({
        stripeAccount: accountId,
      });

      return {
        available: balance.available.map((b) => ({
          amount: b.amount / 100,
          currency: b.currency,
        })),
        pending: balance.pending.map((b) => ({
          amount: b.amount / 100,
          currency: b.currency,
        })),
      };
    } catch (error: any) {
      logger.error('Failed to get account balance', {
        accountId,
        error: error.message,
      });
      throw new ValidationError(`Failed to get account balance: ${error.message}`);
    }
  }

  /**
   * Create payout to merchant's bank account (via Connect)
   */
  async createPayout(accountId: string, amount: number, currency: string) {
    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    try {
      const payout = await platformStripe.payouts.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
        },
        {
          stripeAccount: accountId,
        }
      );

      logger.info('Payout created for merchant', {
        accountId,
        payoutId: payout.id,
        amount,
        currency,
      });

      return {
        payoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: payout.arrival_date,
      };
    } catch (error: any) {
      logger.error('Failed to create payout', {
        accountId,
        error: error.message,
      });
      throw new ValidationError(`Failed to create payout: ${error.message}`);
    }
  }

  /**
   * Retrieve payout status
   */
  async getPayout(payoutId: string, accountId: string) {
    if (!platformStripe) {
      throw new ValidationError(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      );
    }

    try {
      const payout = await platformStripe.payouts.retrieve(payoutId, {
        stripeAccount: accountId,
      });

      return {
        payoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: payout.arrival_date,
        failureCode: payout.failure_code,
        failureMessage: payout.failure_message,
      };
    } catch (error: any) {
      logger.error('Failed to retrieve payout', {
        payoutId,
        accountId,
        error: error.message,
      });
      throw new ValidationError(`Failed to retrieve payout: ${error.message}`);
    }
  }
}

export default new StripeConnectService();


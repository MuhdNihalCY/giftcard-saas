// modules/payments/index.ts — public API for the payments module
// Internal (not exported): StripeService, PayPalService, RazorpayService, UPIService
export { PaymentService } from '../../services/payment/payment.service';
export { CommissionService } from '../../services/commission.service';
export { MerchantPaymentGatewayService } from '../../services/merchant-payment-gateway.service';
export { PaymentRepository } from './payment.repository';

export type {
  CreatePaymentData,
  ConfirmPaymentData,
  RefundPaymentData,
} from '../../services/payment/payment.service';
export type {
  CommissionCalculationResult,
  GetCommissionRateData,
} from '../../services/commission.service';

import paymentService from '../../services/payment/payment.service';
import commissionService from '../../services/commission.service';
import merchantPaymentGatewayService from '../../services/merchant-payment-gateway.service';

export { paymentService, commissionService, merchantPaymentGatewayService };

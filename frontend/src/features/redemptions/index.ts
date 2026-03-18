/**
 * Redemptions feature — public API
 */

// API
export { redemptionsApi } from './api';
export {
  fetchRedemptions,
  fetchRedemptionById,
  redeemGiftCard,
  fetchRedemptionSuggestions,
  checkGiftCardBalance,
  validateGiftCardForRedemption,
  redeemGiftCardByCode,
  redeemGiftCardQR,
  fetchGiftCardTransactions,
} from './api';

// Hooks
export { useRedemptions } from './hooks/useRedemptions';

// Types
export type {
  Redemption,
  RedeemData,
  RedemptionMethod,
  RedemptionListParams,
} from './types';

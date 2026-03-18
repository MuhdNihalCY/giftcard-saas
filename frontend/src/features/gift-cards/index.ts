/**
 * Gift Cards feature — public API
 */

// API
export { giftCardApi } from './api';
export {
  fetchGiftCards,
  fetchGiftCardById,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  redeemGiftCard,
  fetchGiftCardByCode,
  fetchGiftCardTemplates,
  fetchGiftCardProducts,
  fetchGiftCardSuggestions,
  createGiftCardTemplate,
  deleteGiftCardTemplate,
  fetchGiftCardProductById,
  createGiftCardProduct,
  updateGiftCardProduct,
  deleteGiftCardProduct,
  fetchGiftCardByShareToken,
  fetchPublicGiftCardProducts,
} from './api';

// Hooks
export { useGiftCards } from './hooks/useGiftCards';

// Types
export type {
  GiftCard,
  GiftCardStatus,
  GiftCardTemplate,
  GiftCardProduct,
  CreateGiftCardData,
  UpdateGiftCardData,
  RedeemGiftCardData,
  GiftCardListParams,
} from './types';

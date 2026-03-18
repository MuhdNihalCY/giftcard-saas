// modules/redemptions/index.ts — public API for the redemptions module
export { RedemptionService } from '../../services/redemption.service';
export { RedemptionRepository } from './redemption.repository';

export type { RedeemGiftCardData, ValidateGiftCardData } from '../../services/redemption.service';

import redemptionService from '../../services/redemption.service';
export { redemptionService };

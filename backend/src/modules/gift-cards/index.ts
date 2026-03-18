// modules/gift-cards/index.ts — public API for the gift-cards module
// Internal: GiftCardRepository, QRCodeService (not exported from this module)
export { GiftCardService } from '../../services/giftcard.service';
export { GiftCardProductService } from '../../services/giftcard-product.service';
export { GiftCardShareService } from '../../services/giftcard-share.service';
export { GiftCardTemplateService } from '../../services/giftcard-template.service';
export { GiftCardRepository } from './gift-card.repository';

export type { CreateGiftCardData, UpdateGiftCardData } from '../../services/giftcard.service';

import giftCardService from '../../services/giftcard.service';
import giftCardProductService from '../../services/giftcard-product.service';
import giftCardShareService from '../../services/giftcard-share.service';
import giftCardTemplateService from '../../services/giftcard-template.service';

export { giftCardService, giftCardProductService, giftCardShareService, giftCardTemplateService };

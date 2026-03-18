// modules/delivery/index.ts — public API for the delivery module
// Internal: EmailService, SMSService, PDFService (not exported — use DeliveryService)
export { DeliveryService } from '../../services/delivery/delivery.service';

import deliveryService from '../../services/delivery/delivery.service';
export { deliveryService };

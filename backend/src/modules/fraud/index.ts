// modules/fraud/index.ts — public API for the fraud module
export { FraudPreventionService } from '../../services/fraud-prevention.service';
export { IPTrackingService } from '../../services/ip-tracking.service';
export { DeviceService } from '../../services/device.service';
export { FraudRepository } from './fraud.repository';

import fraudPreventionService from '../../services/fraud-prevention.service';
import ipTrackingService from '../../services/ip-tracking.service';
import deviceService from '../../services/device.service';

export { fraudPreventionService, ipTrackingService, deviceService };

// modules/analytics/index.ts — public API for the analytics module
export { AnalyticsService } from '../../services/analytics.service';
export { BreakageService } from '../../services/breakage.service';
export { ChargebackService } from '../../services/chargeback.service';
export { AnalyticsRepository } from './analytics.repository';

export type { AnalyticsFilters } from '../../services/analytics.service';
export type { BreakageCalculation, BreakageReport } from '../../services/breakage.service';

import analyticsService from '../../services/analytics.service';
import breakageService from '../../services/breakage.service';
import chargebackService from '../../services/chargeback.service';

export { analyticsService, breakageService, chargebackService };

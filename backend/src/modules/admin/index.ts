// modules/admin/index.ts — public API for the admin module
export { AuditLogService } from '../../services/audit-log.service';
export { FeatureFlagService } from '../../services/feature-flag.service';
export { BlacklistService } from '../../services/blacklist.service';
export { CommunicationSettingsService } from '../../services/communicationSettings.service';
export { CommunicationLogService } from '../../services/communicationLog.service';
export { AdminRepository } from './admin.repository';

import auditLogService from '../../services/audit-log.service';
import featureFlagService from '../../services/feature-flag.service';
import blacklistService from '../../services/blacklist.service';
import communicationSettingsService from '../../services/communicationSettings.service';
import communicationLogService from '../../services/communicationLog.service';

export { auditLogService, featureFlagService, blacklistService, communicationSettingsService, communicationLogService };

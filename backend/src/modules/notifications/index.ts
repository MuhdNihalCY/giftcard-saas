// modules/notifications/index.ts — public API for the notifications module
// Internal: NotificationRepository (not exported)
// Existing service files remain as the implementation; this index provides the module boundary

export { OTPService } from '../../services/otp.service';
export { EmailVerificationService } from '../../services/emailVerification.service';
export { PasswordResetService } from '../../services/passwordReset.service';
export { NotificationRepository } from './notification.repository';

export type { OTPType, GenerateOTPOptions, VerifyOTPOptions } from '../../services/otp.service';

// Singleton instances for module consumers
import otpService from '../../services/otp.service';
import emailVerificationService from '../../services/emailVerification.service';
import passwordResetService from '../../services/passwordReset.service';

export { otpService, emailVerificationService, passwordResetService };

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const brevo = __importStar(require("@getbrevo/brevo"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const logger_1 = __importDefault(require("../../utils/logger"));
class SMSService {
    twilioClient = null;
    brevoApiInstance = null;
    constructor() {
        if (env_1.env.SMS_SERVICE === 'brevo' && env_1.env.BREVO_API_KEY) {
            // Brevo SMS API
            const apiInstance = new brevo.TransactionalSMSApi();
            apiInstance.setApiKey(brevo.TransactionalSMSApiApiKeys.apiKey, env_1.env.BREVO_API_KEY);
            this.brevoApiInstance = apiInstance;
            logger_1.default.info('Brevo SMS service initialized');
        }
        else if (env_1.env.SMS_SERVICE === 'twilio' && env_1.env.TWILIO_ACCOUNT_SID && env_1.env.TWILIO_AUTH_TOKEN) {
            // Only initialize if credentials are valid (start with AC)
            if (env_1.env.TWILIO_ACCOUNT_SID.startsWith('AC') && env_1.env.TWILIO_AUTH_TOKEN.length > 0) {
                try {
                    this.twilioClient = (0, twilio_1.default)(env_1.env.TWILIO_ACCOUNT_SID, env_1.env.TWILIO_AUTH_TOKEN);
                    logger_1.default.info('Twilio SMS service initialized');
                }
                catch (error) {
                    logger_1.default.warn('Twilio initialization failed, SMS service disabled', { error });
                    this.twilioClient = null;
                }
            }
            else {
                logger_1.default.warn('Twilio credentials not configured, SMS service disabled');
                this.twilioClient = null;
            }
        }
    }
    /**
     * Send SMS
     */
    async sendSMS(options) {
        // Check if SMS is enabled by admin
        const communicationSettingsService = await Promise.resolve().then(() => __importStar(require('../communicationSettings.service'))).then(m => m.default);
        const isEnabled = await communicationSettingsService.isSMSEnabled();
        if (!isEnabled) {
            const communicationLogService = await Promise.resolve().then(() => __importStar(require('../communicationLog.service'))).then(m => m.default);
            await communicationLogService.log({
                channel: 'SMS',
                recipient: options.to,
                message: options.message,
                status: 'BLOCKED',
                errorMessage: 'SMS service disabled by administrator',
            });
            throw new errors_1.ValidationError('SMS service is currently disabled by administrator');
        }
        const communicationLogService = await Promise.resolve().then(() => __importStar(require('../communicationLog.service'))).then(m => m.default);
        try {
            // Use Brevo SMS API if configured
            if (env_1.env.SMS_SERVICE === 'brevo' && this.brevoApiInstance && env_1.env.BREVO_API_KEY && env_1.env.BREVO_SMS_SENDER) {
                const sendTransacSms = new brevo.SendTransacSms();
                sendTransacSms.sender = env_1.env.BREVO_SMS_SENDER;
                sendTransacSms.recipient = options.to;
                sendTransacSms.content = options.message;
                await this.brevoApiInstance.sendTransacSms(sendTransacSms);
                // Log successful SMS
                await communicationLogService.log({
                    channel: 'SMS',
                    recipient: options.to,
                    message: options.message,
                    status: 'SENT',
                });
                return;
            }
            // Use Twilio if configured
            if (env_1.env.SMS_SERVICE === 'twilio' && this.twilioClient) {
                await this.twilioClient.messages.create({
                    body: options.message,
                    from: env_1.env.TWILIO_PHONE_NUMBER,
                    to: options.to,
                });
                // Log successful SMS
                await communicationLogService.log({
                    channel: 'SMS',
                    recipient: options.to,
                    message: options.message,
                    status: 'SENT',
                });
                return;
            }
            throw new errors_1.ValidationError('SMS service not configured. Please set up Brevo or Twilio settings.');
        }
        catch (error) {
            // Log failed SMS
            await communicationLogService.log({
                channel: 'SMS',
                recipient: options.to,
                message: options.message,
                status: 'FAILED',
                errorMessage: error.message,
            });
            throw new errors_1.ValidationError(`SMS sending failed: ${error.message}`);
        }
    }
    /**
     * Send gift card SMS
     */
    async sendGiftCardSMS(data) {
        const { to, giftCardCode, giftCardValue, currency, redemptionUrl, merchantName, expiryDate } = data;
        const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(giftCardValue);
        const expiryText = expiryDate
            ? ` Expires: ${new Date(expiryDate).toLocaleDateString()}.`
            : '';
        const merchantText = merchantName ? ` from ${merchantName}` : '';
        const message = `🎁 You've received a gift card${merchantText} worth ${formattedValue}! Code: ${giftCardCode}.${expiryText} Redeem: ${redemptionUrl}`;
        await this.sendSMS({
            to,
            message,
        });
    }
    /**
     * Send reminder SMS
     */
    async sendReminderSMS(data) {
        const { to, giftCardCode, giftCardValue, currency, daysUntilExpiry, redemptionUrl } = data;
        const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(giftCardValue);
        const message = `⏰ Reminder: Your gift card (${giftCardCode}) worth ${formattedValue} expires in ${daysUntilExpiry} day(s). Redeem now: ${redemptionUrl}`;
        await this.sendSMS({
            to,
            message,
        });
    }
}
exports.SMSService = SMSService;
exports.default = new SMSService();
//# sourceMappingURL=sms.service.js.map
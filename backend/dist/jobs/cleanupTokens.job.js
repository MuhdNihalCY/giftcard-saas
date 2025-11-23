"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCleanupTokens = processCleanupTokens;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Clean up expired tokens
 */
async function processCleanupTokens(job) {
    try {
        const now = new Date();
        // Clean up expired email verification tokens
        const deletedEmailTokens = await database_1.default.emailVerificationToken.deleteMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
        });
        // Clean up expired password reset tokens
        const deletedPasswordTokens = await database_1.default.passwordResetToken.deleteMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
        });
        logger_1.default.info('Token cleanup completed', {
            emailTokens: deletedEmailTokens.count,
            passwordTokens: deletedPasswordTokens.count,
        });
        return {
            emailTokens: deletedEmailTokens.count,
            passwordTokens: deletedPasswordTokens.count,
        };
    }
    catch (error) {
        logger_1.default.error('Error cleaning up tokens', { error: error.message });
        throw error;
    }
}
//# sourceMappingURL=cleanupTokens.job.js.map
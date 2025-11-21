import winston from 'winston';
import { randomUUID } from 'crypto';

// Create request ID for tracking
let requestId: string | null = null;

export const setRequestId = (id?: string) => {
  requestId = id || randomUUID();
};

export const getRequestId = () => requestId;

export const clearRequestId = () => {
  requestId = null;
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format((info) => {
      // Add request ID to all log entries
      if (requestId) {
        info.requestId = requestId;
      }
      return info;
    })(),
    winston.format.json()
  ),
  defaultMeta: { service: 'giftcard-saas' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for all environments (useful for production monitoring)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
} else {
  // In production, use JSON format for console (better for log aggregation)
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

export default logger;


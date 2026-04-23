import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

/**
 * Structured logger — JSON in production, pretty-printed in development.
 * Never use console.log in production code.
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  defaultMeta: { service: 'priest-booking-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'development'
          ? combine(
              colorize(),
              printf(({ level, message, timestamp: ts, ...meta }) => {
                const metaStr =
                  Object.keys(meta).length > 1 ? `\n${JSON.stringify(meta, null, 2)}` : '';
                return `${ts} [${level}]: ${message}${metaStr}`;
              })
            )
          : combine(json()),
    }),
  ],
});

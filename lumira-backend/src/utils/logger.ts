import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'lumira-backend' },
  transports: [
    // Render captures stdout — always log to console
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'development'
          ? combine(colorize(), simple())
          : combine(timestamp(), json()),
    }),
  ],
});

export default logger;

import './config/env'; // Validate env vars first — exits if invalid
import { createApp } from './app';
import prisma from './config/database';
import { env } from './config/env';
import logger from './utils/logger';
import { Request, Response } from 'express';

const app = createApp();

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 Lumira backend running on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    port: env.PORT,
  });
});

// ─────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });

  // Force exit after 10s if connections don't close
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

export default app;

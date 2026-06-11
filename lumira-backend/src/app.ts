import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import prisma from './config/database';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import patientsRoutes from './modules/patients/patients.routes';
import doctorsRoutes from './modules/doctors/doctors.routes';
import departmentsRoutes from './modules/departments/departments.routes';
import revenueRoutes from './modules/revenue/revenue.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler.middleware';
import { notFound } from './middleware/notFound.middleware';

export function createApp(): Application {
  const app = express();

  // ─────────────────────────────────────────
  // Security Headers
  // ─────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
    })
  );

  // ─────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
      },
      credentials: true, // required for cookies
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ─────────────────────────────────────────
  // General Middleware
  // ─────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // HTTP Request logging (morgan → stdout → Render captures)
  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev')
  );

  // ─────────────────────────────────────────
  // Global Rate Limiting: 100 req / 15 min per IP
  // ─────────────────────────────────────────
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ─────────────────────────────────────────
  // Routes
  // ─────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/patients', patientsRoutes);
  app.use('/api/doctors', doctorsRoutes);
  app.use('/api/departments', departmentsRoutes);
  app.use('/api/revenue', revenueRoutes);
  app.use('/api/appointments', appointmentsRoutes);

  // ─────────────────────────────────────────
  // Health Check Endpoint
  // ─────────────────────────────────────────
  app.get('/api/health', async (req: express.Request, res: express.Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: 'connected',
        environment: env.NODE_ENV,
      });
    } catch {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        db: 'disconnected',
      });
    }
  });

  // ─────────────────────────────────────────
  // Error Handling (must be last)
  // ─────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

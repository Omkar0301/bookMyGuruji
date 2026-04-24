import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import mongoose from 'mongoose';
import apiRouter from './routes';
import { setupSwagger } from './config/swagger';
import passport from './config/passport';

const app = express();

// Initialize Swagger
setupSwagger(app);

// Initialize Passport
app.use(passport.initialize());

// ────────────────────────────────────────────────────────────────
// Security middleware
// ────────────────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(mongoSanitize());

// ────────────────────────────────────────────────────────────────
// Rate limiting
// ────────────────────────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1', apiLimiter);

// ────────────────────────────────────────────────────────────────
// Body parsing & logging
// ────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ────────────────────────────────────────────────────────────────
// Health check (excluded from auth & rate limiting)
// ────────────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: dbOk ? 'ok' : 'error',
    },
  });
});

// ────────────────────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────────────────────

app.use('/api/v1', apiRouter);

// ────────────────────────────────────────────────────────────────
// 404 handler
// ────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ────────────────────────────────────────────────────────────────
// Global error handler — MUST be last
// ────────────────────────────────────────────────────────────────

app.use(errorHandler);

export default app;

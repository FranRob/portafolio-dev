import cors from 'cors';
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import { errorMiddleware } from './lib/errorMiddleware.js';
import { requestLogger } from './lib/requestLogger.js';
import { logger } from './lib/logger.js';

const app = express();

// Trust proxy for rate-limit behind Nginx
app.set('trust proxy', 1);

// Security headers middleware
app.use((req: Request, res: Response, next: Function) => {
  // HSTS - Forces HTTPS for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Prevents clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // CSP - restricts where resources can be loaded from
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"
  );
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas requests, intentá de nuevo más tarde.' },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', publicLimiter, analyticsRoutes);
app.use('/api/contact', publicLimiter, contactRoutes);
app.use('/api/projects', publicLimiter, projectRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Global error handler
app.use(errorMiddleware);

export default app;

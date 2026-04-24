import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { protect } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation';

const router = Router();

// Rate limiter for login: 5 attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication routes
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   first: { type: string, example: "John" }
 *                   last: { type: string, example: "Doe" }
 *               email: { type: string, format: email, example: "john@example.com" }
 *               phone: { type: string, example: "1234567890" }
 *               password: { type: string, minLength: 8, example: "Password@123" }
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /auth/register/priest:
 *   post:
 *     summary: Register a new priest
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   first: { type: string, example: "Priest" }
 *                   last: { type: string, example: "Doe" }
 *               email: { type: string, format: email, example: "priest@example.com" }
 *               phone: { type: string, example: "9876543210" }
 *               password: { type: string, minLength: 8, example: "Password@123" }
 *     responses:
 *       201:
 *         description: Priest registered
 */
router.post('/register/priest', validate(registerSchema), AuthController.registerPriest);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "john@example.com" }
 *               password: { type: string, example: "Password@123" }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email using token
 *     tags: [Auth]
 */
router.get('/verify-email/:token', validate(verifyEmailSchema), AuthController.verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password - send reset link
 *     tags: [Auth]
 */
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 */
router.post('/reset-password/:token', validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', AuthController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', protect, AuthController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 */
router.get('/me', protect, AuthController.getMe);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  AuthController.googleAuthSuccess
);

export default router;

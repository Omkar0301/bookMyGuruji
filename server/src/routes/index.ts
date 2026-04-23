import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

/**
 * @route   GET /api/v1/ping
 * @desc    Liveness check
 * @access  Public
 */
router.get('/ping', (_req, res) => {
  res.status(200).json({ success: true, message: 'pong' });
});

/**
 * @route   /api/v1/auth
 * @desc    Authentication routes
 */
router.use('/auth', authRoutes);

// TODO: router.use('/users', userRoutes);
// TODO: router.use('/priests', priestRoutes);
// TODO: router.use('/bookings', bookingRoutes);
// TODO: router.use('/payments', paymentRoutes);
// TODO: router.use('/reviews', reviewRoutes);
// TODO: router.use('/notifications', notificationRoutes);

export default router;

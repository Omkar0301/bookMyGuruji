import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import priestRoutes from './priest.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';

const router = Router();

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Liveness check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is alive
 */
router.get('/ping', (_req, res) => {
  res.status(200).json({ success: true, message: 'pong' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/priests', priestRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;

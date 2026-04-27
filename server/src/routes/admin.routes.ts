import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { BookingController } from '../controllers/booking.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations
 */

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Admin view all bookings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Fetched all bookings
 */
router.get('/bookings', protect, restrictTo('admin'), BookingController.getAllBookings);

export default router;

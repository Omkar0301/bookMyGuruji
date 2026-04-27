import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { BookingController } from '../controllers/booking.controller';
import {
  createBookingSchema,
  cancelBookingSchema,
  declineBookingSchema,
  disputeBookingSchema,
} from '../validations/booking.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [priestId, ceremony, scheduledDate, scheduledTime, venue]
 *             properties:
 *               priestId: { type: string }
 *               ceremony:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   duration: { type: number }
 *                   description: { type: string }
 *               scheduledDate: { type: string, format: date-time }
 *               scheduledTime: { type: string, example: "09:00" }
 *               venue:
 *                 type: object
 *                 properties:
 *                   address: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   pincode: { type: string }
 *                   coordinates: { type: array, items: { type: number } }
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error or Priest unavailable
 *       409:
 *         description: Time slot unavailable
 */
router.post(
  '/',
  protect,
  restrictTo('user'),
  validate(createBookingSchema),
  BookingController.createBooking
);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get my bookings (user sees own, priest sees assigned)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Fetched bookings
 */
router.get('/', protect, BookingController.getMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get('/:id', protect, BookingController.getBookingById);

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   patch:
 *     summary: Priest confirms a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/confirm', protect, restrictTo('priest'), BookingController.confirmBooking);

/**
 * @swagger
 * /bookings/{id}/decline:
 *   patch:
 *     summary: Priest declines a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Booking declined
 *       403:
 *         description: Forbidden
 */
router.patch(
  '/:id/decline',
  protect,
  restrictTo('priest'),
  validate(declineBookingSchema),
  BookingController.declineBooking
);

/**
 * @swagger
 * /bookings/{id}/complete:
 *   patch:
 *     summary: Priest marks a booking as complete
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking completed
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/complete', protect, restrictTo('priest'), BookingController.completeBooking);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: User or Priest cancels a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       403:
 *         description: Forbidden
 */
router.patch(
  '/:id/cancel',
  protect,
  validate(cancelBookingSchema),
  BookingController.cancelBooking
);

/**
 * @swagger
 * /bookings/{id}/dispute:
 *   patch:
 *     summary: User or Priest raises a dispute
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Booking disputed
 *       403:
 *         description: Forbidden
 */
router.patch(
  '/:id/dispute',
  protect,
  validate(disputeBookingSchema),
  BookingController.disputeBooking
);

export default router;

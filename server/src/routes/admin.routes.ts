import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations
 */

// ────────────────────────────────────────────────────────────────
// PRIEST VERIFICATION
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/verifications:
 *   get:
 *     summary: List pending priest verifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Fetched all pending verifications
 */
router.get('/verifications', AdminController.getVerifications);

/**
 * @swagger
 * /admin/verifications/{priestId}/approve:
 *   patch:
 *     summary: Approve a priest verification
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: priestId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Priest approved
 */
router.patch('/verifications/:priestId/approve', AdminController.approveVerification);

/**
 * @swagger
 * /admin/verifications/{priestId}/reject:
 *   patch:
 *     summary: Reject a priest verification
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: priestId
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
 *               reason: { type: string, minLength: 10 }
 *     responses:
 *       200:
 *         description: Priest rejected
 */
router.patch('/verifications/:priestId/reject', AdminController.rejectVerification);

// ────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Fetched users
 */
router.get('/users', AdminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
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
 *         description: Fetched user
 */
router.get('/users/:id', AdminController.getUserById);

/**
 * @swagger
 * /admin/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [Admin]
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
 *         description: User deactivated
 */
router.patch('/users/:id/deactivate', AdminController.deactivateUser);

/**
 * @swagger
 * /admin/users/{id}/activate:
 *   patch:
 *     summary: Activate a user
 *     tags: [Admin]
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
 *         description: User activated
 */
router.patch('/users/:id/activate', AdminController.activateUser);

// ────────────────────────────────────────────────────────────────
// BOOKING MANAGEMENT
// ────────────────────────────────────────────────────────────────

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
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: fromDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: toDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: priestId
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
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
router.get('/bookings', AdminController.getBookings);

/**
 * @swagger
 * /admin/bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Admin]
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
 *         description: Fetched booking
 */
router.get('/bookings/:id', AdminController.getBookingById);

/**
 * @swagger
 * /admin/bookings/{id}/override-status:
 *   patch:
 *     summary: Override booking status
 *     tags: [Admin]
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
 *             required: [status]
 *             properties:
 *               status: { type: string }
 *               adminNote: { type: string }
 *     responses:
 *       200:
 *         description: Booking status overridden
 */
router.patch('/bookings/:id/override-status', AdminController.overrideBookingStatus);

// ────────────────────────────────────────────────────────────────
// DISPUTE RESOLUTION
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/disputes:
 *   get:
 *     summary: Get all disputes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Fetched all disputes
 */
router.get('/disputes', AdminController.getDisputes);

/**
 * @swagger
 * /admin/disputes/{bookingId}/resolve:
 *   patch:
 *     summary: Resolve a dispute
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution, adminNote]
 *             properties:
 *               resolution: { type: string, enum: ['favour_user', 'favour_priest', 'split'] }
 *               adminNote: { type: string }
 *               userRefundPercent: { type: number, description: "Required if resolution is split" }
 *     responses:
 *       200:
 *         description: Dispute resolved
 */
router.patch('/disputes/:bookingId/resolve', AdminController.resolveDispute);

// ────────────────────────────────────────────────────────────────
// ANALYTICS
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/analytics/overview:
 *   get:
 *     summary: Get analytics overview
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview fetched
 */
router.get('/analytics/overview', AdminController.getAnalyticsOverview);

/**
 * @swagger
 * /admin/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Revenue analytics fetched
 */
router.get('/analytics/revenue', AdminController.getRevenueAnalytics);

/**
 * @swagger
 * /admin/analytics/top-priests:
 *   get:
 *     summary: Get top priests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Top priests fetched
 */
router.get('/analytics/top-priests', AdminController.getTopPriests);

export default router;

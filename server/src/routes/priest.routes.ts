import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { PriestController } from '../controllers/priest.controller';
import {
  searchPriestsSchema,
  nearbyPriestsSchema,
  priestIdParamSchema,
  updateProfileSchema,
  updateServicesSchema,
  getAvailabilitySchema,
  updateAvailabilitySchema,
  availabilityOverrideSchema,
} from '../validations/priest.validation';

const router = Router();

// ────────────────────────────────────────────────────────────────
// Swagger component schemas
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeSlot:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           example: "13:00"
 *
 *     Service:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Vivah"
 *         description:
 *           type: string
 *           example: "Traditional wedding ceremony"
 *         basePriceINR:
 *           type: number
 *           example: 5000
 *         duration:
 *           type: number
 *           example: 2
 *         includesMaterials:
 *           type: boolean
 *           example: false
 *
 *     PriestPublicProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64abc123def456"
 *         bio:
 *           type: string
 *         specialisations:
 *           type: array
 *           items:
 *             type: string
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         experience:
 *           type: number
 *         services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Service'
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               example: 4.5
 *             count:
 *               type: number
 *               example: 120
 *         isAvailable:
 *           type: boolean
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: object
 *               properties:
 *                 first:
 *                   type: string
 *                 last:
 *                   type: string
 *             avatar:
 *               type: string
 */

// ────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth)
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /priests:
 *   get:
 *     summary: Search and list priests
 *     description: Returns approved, available priests. Supports filtering by city, ceremony, language, rating, and price.
 *     tags: [Priests]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city / service area
 *       - in: query
 *         name: ceremony
 *         schema:
 *           type: string
 *         description: Filter by ceremony type (matched in specialisations)
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language spoken
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum average rating
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum base price for any service
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Free-text search across bio, specialisations, serviceAreas
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (prefix with "-" for descending, e.g. "-rating.average")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated list of priests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Priests fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PriestPublicProfile'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', validate(searchPriestsSchema), PriestController.searchPriests);

/**
 * @swagger
 * /priests/nearby:
 *   get:
 *     summary: Geo-search priests within a radius
 *     description: Uses MongoDB $nearSphere on user address.location (2dsphere index).
 *     tags: [Priests]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *           default: 25
 *         description: Search radius in kilometres (default 25)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of nearby priests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Nearby priests fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PriestPublicProfile'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Missing lat/lng parameters
 */
router.get('/nearby', validate(nearbyPriestsSchema), PriestController.nearbyPriests);

/**
 * @swagger
 * /priests/availability/{id}:
 *   get:
 *     summary: Get available time slots for a priest
 *     description: Returns available slots per date, accounting for weekly schedule, overrides, and existing bookings.
 *     tags: [Priests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Priest profile ID
 *       - in: query
 *         name: fromDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-01"
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-07"
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Available slots by date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Available slots fetched"
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/TimeSlot'
 *                   example:
 *                     "2026-05-01":
 *                       - startTime: "09:00"
 *                         endTime: "11:00"
 *                       - startTime: "14:00"
 *                         endTime: "17:00"
 *       404:
 *         description: Availability not configured
 */
router.get('/availability/:id', validate(getAvailabilitySchema), PriestController.getAvailability);

/**
 * @swagger
 * /priests/{id}:
 *   get:
 *     summary: Get priest public profile
 *     description: Returns the public profile of an approved priest. Never exposes bankDetails.
 *     tags: [Priests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64abc123def456"
 *         description: Priest profile ID
 *     responses:
 *       200:
 *         description: Priest profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Priest profile fetched"
 *                 data:
 *                   $ref: '#/components/schemas/PriestPublicProfile'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validate(priestIdParamSchema), PriestController.getPublicProfile);

// ────────────────────────────────────────────────────────────────
// PROTECTED ROUTES (priest only)
// ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /priests/profile:
 *   put:
 *     summary: Update own priest profile
 *     description: Priest updates their own profile fields (bio, specialisations, languages, etc.)
 *     tags: [Priests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Experienced Vedic priest with 15+ years"
 *               specialisations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Vivah", "Griha Pravesh", "Satyanarayan Katha"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Hindi", "Sanskrit", "English"]
 *               experience:
 *                 type: number
 *                 example: 15
 *               education:
 *                 type: string
 *                 example: "Banaras Hindu University"
 *               travelRadius:
 *                 type: number
 *                 example: 50
 *               serviceAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Mumbai", "Pune", "Thane"]
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated"
 *                 data:
 *                   $ref: '#/components/schemas/PriestPublicProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a priest or not own profile
 */
router.put(
  '/profile',
  protect,
  authorize('priest'),
  validate(updateProfileSchema),
  PriestController.updateProfile
);

/**
 * @swagger
 * /priests/services:
 *   put:
 *     summary: Update services and pricing
 *     description: Replace all services for the logged-in priest.
 *     tags: [Priests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [services]
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Services updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Services updated"
 *                 data:
 *                   $ref: '#/components/schemas/PriestPublicProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a priest or not own profile
 */
router.put(
  '/services',
  protect,
  authorize('priest'),
  validate(updateServicesSchema),
  PriestController.updateServices
);

/**
 * @swagger
 * /priests/availability:
 *   put:
 *     summary: Update weekly availability schedule
 *     description: Replace the weekly schedule with new day/slot entries.
 *     tags: [Priests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weeklySchedule]
 *             properties:
 *               weeklySchedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [dayOfWeek]
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: "0=Sunday … 6=Saturday"
 *                     slots:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeSlot'
 *           example:
 *             weeklySchedule:
 *               - dayOfWeek: 1
 *                 slots:
 *                   - startTime: "09:00"
 *                     endTime: "13:00"
 *                   - startTime: "14:00"
 *                     endTime: "18:00"
 *               - dayOfWeek: 3
 *                 slots:
 *                   - startTime: "10:00"
 *                     endTime: "16:00"
 *     responses:
 *       200:
 *         description: Weekly schedule updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a priest
 */
router.put(
  '/availability',
  protect,
  authorize('priest'),
  validate(updateAvailabilitySchema),
  PriestController.updateAvailability
);

/**
 * @swagger
 * /priests/availability/override:
 *   post:
 *     summary: Block or open a specific date
 *     description: Add an availability override for a specific date. Use type "blocked" to block the entire day, or "available" with custom slots.
 *     tags: [Priests]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, type]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-15"
 *               type:
 *                 type: string
 *                 enum: [blocked, available]
 *                 example: "blocked"
 *               slots:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimeSlot'
 *                 description: Required when type is "available"
 *               reason:
 *                 type: string
 *                 example: "Personal holiday"
 *     responses:
 *       201:
 *         description: Override added
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a priest
 */
router.post(
  '/availability/override',
  protect,
  authorize('priest'),
  validate(availabilityOverrideSchema),
  PriestController.addAvailabilityOverride
);

export default router;

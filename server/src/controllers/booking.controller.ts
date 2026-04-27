import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { PriestProfile } from '../models/priestProfile.model';
import { catchAsync } from '../utils/catchAsync';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response';

// Helper to get priest profile ID
const getPriestProfileId = async (userId: string): Promise<string | null> => {
  const profile = await PriestProfile.findOne({ user: userId }).lean();
  return profile ? profile._id.toString() : null;
};

// ────────────────────────────────────────────────────────────────
// Controller
// ────────────────────────────────────────────────────────────────

export class BookingController {
  /**
   * POST /bookings — Create a new booking
   */
  static createBooking = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id || req.user.role !== 'user') {
      return errorResponse(res, 'Forbidden', 403);
    }

    const booking = await BookingService.createBooking(req.user.id, req.body);
    return successResponse(res, booking, 'Booking created successfully', 201);
  });

  /**
   * GET /bookings — Get my bookings (user sees own, priest sees assigned)
   */
  static getMyBookings = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    let priestProfileId = null;
    if (req.user.role === 'priest') {
      priestProfileId = await getPriestProfileId(req.user.id);
    }

    const bookings = await BookingService.getMyBookings(
      req.user.id,
      req.user.role,
      priestProfileId || undefined
    );
    return successResponse(res, bookings, 'Bookings fetched successfully');
  });

  /**
   * GET /bookings/:id — Get booking details
   */
  static getBookingById = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) return errorResponse(res, 'Not authenticated', 401);

    const booking = await BookingService.getBookingById(req.params.id as string);

    // Ownership check
    if (req.user.role === 'user' && booking.user._id.toString() !== req.user.id) {
      return errorResponse(res, 'Forbidden', 403);
    }
    if (req.user.role === 'priest') {
      const priestProfileId = await getPriestProfileId(req.user.id);
      if (booking.priest._id.toString() !== priestProfileId) {
        return errorResponse(res, 'Forbidden', 403);
      }
    }

    return successResponse(res, booking, 'Booking details fetched');
  });

  /**
   * PATCH /bookings/:id/confirm — Priest confirms a booking
   */
  static confirmBooking = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id || req.user.role !== 'priest') {
      return errorResponse(res, 'Forbidden', 403);
    }

    const priestProfileId = await getPriestProfileId(req.user.id);
    if (!priestProfileId) return errorResponse(res, 'Priest profile not found', 404);

    const booking = await BookingService.confirmBooking(req.params.id as string, priestProfileId);
    return successResponse(res, booking, 'Booking confirmed');
  });

  /**
   * PATCH /bookings/:id/decline — Priest declines a booking
   */
  static declineBooking = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id || req.user.role !== 'priest') {
      return errorResponse(res, 'Forbidden', 403);
    }

    const priestProfileId = await getPriestProfileId(req.user.id);
    if (!priestProfileId) return errorResponse(res, 'Priest profile not found', 404);

    const booking = await BookingService.declineBooking(
      req.params.id as string,
      priestProfileId,
      req.body.reason
    );
    return successResponse(res, booking, 'Booking declined');
  });

  /**
   * PATCH /bookings/:id/complete — Priest marks a booking as complete
   */
  static completeBooking = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id || req.user.role !== 'priest') {
      return errorResponse(res, 'Forbidden', 403);
    }

    const priestProfileId = await getPriestProfileId(req.user.id);
    if (!priestProfileId) return errorResponse(res, 'Priest profile not found', 404);

    const booking = await BookingService.completeBooking(req.params.id as string, priestProfileId);
    return successResponse(res, booking, 'Booking marked as completed');
  });

  /**
   * PATCH /bookings/:id/cancel — User or Priest cancels a booking
   */
  static cancelBooking = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    let priestProfileId = null;
    if (req.user.role === 'priest') {
      priestProfileId = await getPriestProfileId(req.user.id);
    }

    const booking = await BookingService.cancelBooking(
      req.params.id as string,
      req.user.id,
      req.user.role,
      priestProfileId,
      req.body.reason
    );
    return successResponse(res, booking, 'Booking cancelled');
  });

  /**
   * PATCH /bookings/:id/dispute — User or Priest raises a dispute
   */
  static disputeBooking = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    let priestProfileId = null;
    if (req.user.role === 'priest') {
      priestProfileId = await getPriestProfileId(req.user.id);
    }

    const booking = await BookingService.disputeBooking(
      req.params.id as string,
      req.user.id,
      req.user.role,
      priestProfileId,
      req.body.reason
    );
    return successResponse(res, booking, 'Dispute raised');
  });

  /**
   * GET /admin/bookings — Admin views all bookings
   */
  static getAllBookings = catchAsync(async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
      return errorResponse(res, 'Forbidden', 403);
    }

    const { page = 1, limit = 20 } = req.query;
    const { data, total } = await BookingService.getAllBookings(Number(page), Number(limit));

    return paginatedResponse(res, data, total, Number(page), Number(limit), 'All bookings fetched');
  });
}

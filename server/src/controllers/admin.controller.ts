import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response';
import { AdminService } from '../services/admin.service';

export class AdminController {
  // ────────────────────────────────────────────────────────────────
  // PRIEST VERIFICATION
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/verifications — List all pending priest verifications
   */
  static getVerifications = catchAsync(async (req: Request, res: Response) => {
    const verifications = await AdminService.getPendingVerifications();
    return successResponse(res, verifications, 'Pending verifications fetched successfully');
  });

  /**
   * PATCH /admin/verifications/:priestId/approve — Approve a priest verification
   */
  static approveVerification = catchAsync(async (req: Request, res: Response) => {
    const priestId = req.params.priestId as string;
    const priest = await AdminService.approvePriest(priestId);
    return successResponse(res, priest, 'Priest verification approved successfully');
  });

  /**
   * PATCH /admin/verifications/:priestId/reject — Reject a priest verification
   */
  static rejectVerification = catchAsync(async (req: Request, res: Response) => {
    const priestId = req.params.priestId as string;
    const reason = req.body.reason as string;
    if (!reason || reason.length < 10) {
      return errorResponse(res, 'Reason is required and must be at least 10 characters long', 400);
    }
    const priest = await AdminService.rejectPriest(priestId, reason);
    return successResponse(res, priest, 'Priest verification rejected');
  });

  // ────────────────────────────────────────────────────────────────
  // USER MANAGEMENT
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/users — Get all users with filtering and pagination
   */
  static getUsers = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, role, isActive, search } = req.query;
    const { data, total } = await AdminService.getUsers(
      { role: role as string, isActive: isActive as string, search: search as string },
      Number(page),
      Number(limit)
    );
    return paginatedResponse(
      res,
      data,
      total,
      Number(page),
      Number(limit),
      'Users fetched successfully'
    );
  });

  /**
   * GET /admin/users/:id — Get user by ID
   */
  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await AdminService.getUserById(req.params.id as string);
    return successResponse(res, user, 'User details fetched successfully');
  });

  /**
   * PATCH /admin/users/:id/deactivate — Deactivate a user
   */
  static deactivateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await AdminService.deactivateUser(req.params.id as string);
    return successResponse(res, user, 'User deactivated successfully');
  });

  /**
   * PATCH /admin/users/:id/activate — Activate a user
   */
  static activateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await AdminService.activateUser(req.params.id as string);
    return successResponse(res, user, 'User activated successfully');
  });

  // ────────────────────────────────────────────────────────────────
  // BOOKING MANAGEMENT
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/bookings — Admin view all bookings with filters
   */
  static getBookings = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, fromDate, toDate, priestId, userId } = req.query;
    const { data, total } = await AdminService.getBookings(
      {
        status: status as string,
        fromDate: fromDate as string,
        toDate: toDate as string,
        priestId: priestId as string,
        userId: userId as string,
      },
      Number(page),
      Number(limit)
    );
    return paginatedResponse(
      res,
      data,
      total,
      Number(page),
      Number(limit),
      'Bookings fetched successfully'
    );
  });

  /**
   * GET /admin/bookings/:id — Get full details of a single booking
   */
  static getBookingById = catchAsync(async (req: Request, res: Response) => {
    const booking = await AdminService.getBookingById(req.params.id as string);
    return successResponse(res, booking, 'Booking details fetched successfully');
  });

  /**
   * PATCH /admin/bookings/:id/override-status — Force a booking status override
   */
  static overrideBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const { status, adminNote } = req.body;
    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }
    const booking = await AdminService.overrideBookingStatus(
      req.params.id as string,
      status,
      adminNote
    );
    return successResponse(res, booking, 'Booking status overridden successfully');
  });

  // ────────────────────────────────────────────────────────────────
  // DISPUTE RESOLUTION
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/disputes — View all disputed bookings
   */
  static getDisputes = catchAsync(async (req: Request, res: Response) => {
    const disputes = await AdminService.getDisputes();
    return successResponse(res, disputes, 'Disputed bookings fetched successfully');
  });

  /**
   * PATCH /admin/disputes/:bookingId/resolve — Resolve a disputed booking
   */
  static resolveDispute = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId as string;
    const { resolution, adminNote, userRefundPercent } = req.body;

    if (!resolution || !adminNote) {
      return errorResponse(res, 'Resolution and adminNote are required', 400);
    }

    const booking = await AdminService.resolveDispute(
      bookingId,
      resolution,
      adminNote,
      userRefundPercent
    );
    return successResponse(res, booking, 'Dispute resolved successfully');
  });

  // ────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ────────────────────────────────────────────────────────────────

  /**
   * GET /admin/analytics/overview — Get high-level analytics for dashboard
   */
  static getAnalyticsOverview = catchAsync(async (req: Request, res: Response) => {
    const analytics = await AdminService.getOverviewAnalytics();
    return successResponse(res, analytics, 'Analytics overview fetched successfully');
  });

  /**
   * GET /admin/analytics/revenue — Get revenue stats by date range
   */
  static getRevenueAnalytics = catchAsync(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const revenue = await AdminService.getRevenueAnalytics(from as string, to as string);
    return successResponse(res, revenue, 'Revenue analytics fetched successfully');
  });

  /**
   * GET /admin/analytics/top-priests — Get list of highest earning priests
   */
  static getTopPriests = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const priests = await AdminService.getTopPriests(Number(limit));
    return successResponse(res, priests, 'Top priests fetched successfully');
  });
}

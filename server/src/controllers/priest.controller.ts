import { Request, Response } from 'express';
import { PriestService } from '../services/priest.service';
import { AvailabilityService } from '../services/availability.service';
import { catchAsync } from '../utils';
import { successResponse, paginatedResponse } from '../utils/response';

// ────────────────────────────────────────────────────────────────
// Controller
// ────────────────────────────────────────────────────────────────

export class PriestController {
  /**
   * GET /priests — Search / list priests with query filters.
   */
  static searchPriests = catchAsync(async (req: Request, res: Response) => {
    const {
      city,
      ceremony,
      language,
      minRating,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const { data, total } = await PriestService.searchPriests({
      city: city as string | undefined,
      ceremony: ceremony as string | undefined,
      language: language as string | undefined,
      minRating: minRating ? Number(minRating) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search as string | undefined,
      sort: sort as string | undefined,
      page: Number(page),
      limit: Number(limit),
    });

    return paginatedResponse(res, data, total, Number(page), Number(limit), 'Priests fetched');
  });

  /**
   * GET /priests/nearby — Geo-search within radius.
   */
  static nearbyPriests = catchAsync(async (req: Request, res: Response) => {
    const { lat, lng, radiusKm = 25, page = 1, limit = 20 } = req.query;

    const { data, total } = await PriestService.nearbyPriests({
      lat: Number(lat),
      lng: Number(lng),
      radiusKm: Number(radiusKm),
      page: Number(page),
      limit: Number(limit),
    });

    return paginatedResponse(
      res,
      data,
      total,
      Number(page),
      Number(limit),
      'Nearby priests fetched'
    );
  });

  /**
   * GET /priests/:id — Get priest public profile.
   */
  static getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    const priest = await PriestService.getPublicProfile(req.params.id ?? '');
    return successResponse(res, priest, 'Priest profile fetched');
  });

  /**
   * PUT /priests/profile — Update own profile.
   */
  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    const priestProfile = await PriestService.getProfileByUserId(req.user!.id);
    const updated = await PriestService.updateProfile(priestProfile.id, req.user!.id, req.body);
    return successResponse(res, updated, 'Profile updated');
  });

  /**
   * PUT /priests/services — Update services & pricing.
   */
  static updateServices = catchAsync(async (req: Request, res: Response) => {
    const priestProfile = await PriestService.getProfileByUserId(req.user!.id);
    const updated = await PriestService.updateServices(
      priestProfile.id,
      req.user!.id,
      req.body.services
    );
    return successResponse(res, updated, 'Services updated');
  });

  /**
   * GET /priests/availability/:id — Get available slots for a date range.
   */
  static getAvailability = catchAsync(async (req: Request, res: Response) => {
    const { fromDate, toDate } = req.query;
    const slots = await AvailabilityService.getAvailableSlots(
      req.params.id ?? '',
      String(fromDate),
      String(toDate)
    );
    return successResponse(res, slots, 'Available slots fetched');
  });

  /**
   * PUT /priests/availability — Update weekly schedule.
   */
  static updateAvailability = catchAsync(async (req: Request, res: Response) => {
    const priestProfile = await PriestService.getProfileByUserId(req.user!.id);
    const availability = await AvailabilityService.updateWeeklySchedule(
      priestProfile.id,
      req.body.weeklySchedule
    );
    return successResponse(res, availability, 'Weekly schedule updated');
  });

  /**
   * POST /priests/availability/override — Block or open specific dates.
   */
  static addAvailabilityOverride = catchAsync(async (req: Request, res: Response) => {
    const priestProfile = await PriestService.getProfileByUserId(req.user!.id);
    const availability = await AvailabilityService.addOverride(priestProfile.id, req.body);
    return successResponse(res, availability, 'Availability override added', 201);
  });
}

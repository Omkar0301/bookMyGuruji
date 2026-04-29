import mongoose from 'mongoose';
import { VerificationStatus, UserRole } from '../constants/enums';
import { PriestProfile, IPriestProfile, User } from '../models';
import { AppError } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeanDoc = Record<string, any>;

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

interface SearchFilters {
  city?: string;
  ceremony?: string;
  language?: string;
  minRating?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page: number;
  limit: number;
}

interface NearbyFilters {
  lat: number;
  lng: number;
  radiusKm: number;
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
}

// ────────────────────────────────────────────────────────────────
// Fields to exclude from public responses
// ────────────────────────────────────────────────────────────────

const PUBLIC_SELECT =
  'user bio specialisations languages experience education certificates gallery services travelRadius serviceAreas rating verificationStatus isAvailable createdAt';

// ────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────

export class PriestService {
  /**
   * Search and list priests with query filters.
   * Only returns approved + available priests.
   */
  static async searchPriests(filters: SearchFilters): Promise<PaginatedResult<LeanDoc>> {
    const { city, ceremony, language, minRating, maxPrice, search, sort, page, limit } = filters;

    const query: Record<string, unknown> = {
      verificationStatus: VerificationStatus.APPROVED,
      isAvailable: true,
    };

    // Filter by city (match in serviceAreas)
    if (city) {
      query.serviceAreas = { $regex: new RegExp(city, 'i') };
    }

    // Filter by ceremony (match in specialisations)
    if (ceremony) {
      query.specialisations = { $regex: new RegExp(ceremony, 'i') };
    }

    // Filter by language
    if (language) {
      query.languages = { $regex: new RegExp(language, 'i') };
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      query['rating.average'] = { $gte: minRating };
    }

    // Filter by max price (at least one service ≤ maxPrice)
    if (maxPrice !== undefined) {
      query['services.basePriceINR'] = { $lte: maxPrice };
    }

    // Free-text search across bio, specialisations, serviceAreas
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { bio: searchRegex },
        { specialisations: searchRegex },
        { serviceAreas: searchRegex },
      ];
    }

    // Sort
    let sortOption: Record<string, 1 | -1> = { 'rating.average': -1 };
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder: 1 | -1 = sort.startsWith('-') ? -1 : 1;
      sortOption = { [sortField]: sortOrder };
    }

    const skip = (page - 1) * limit;
    const safeLimit = Math.min(limit, 100);

    const [data, total] = await Promise.all([
      PriestProfile.find(query)
        .select(PUBLIC_SELECT)
        .populate({ path: 'user', select: 'name avatar address.city address.state phone' })
        .sort(sortOption)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      PriestProfile.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Geo-search priests near coordinates.
   * Uses the User model's address.location (2dsphere index).
   */
  static async nearbyPriests(filters: NearbyFilters): Promise<PaginatedResult<LeanDoc>> {
    const { lat, lng, radiusKm, page, limit } = filters;
    const radiusMeters = radiusKm * 1000;
    const skip = (page - 1) * limit;
    const safeLimit = Math.min(limit, 100);

    // Step 1: Find user IDs near the location who are priests
    const nearbyUsers = await User.find({
      role: UserRole.PRIEST,
      isActive: true,
      'address.location': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
          },
          $maxDistance: radiusMeters,
        },
      },
    })
      .select('_id')
      .lean();

    const userIds = nearbyUsers.map((u) => u._id);

    if (userIds.length === 0) {
      return { data: [], total: 0 };
    }

    // Step 2: Find priest profiles for those users
    const query = {
      user: { $in: userIds },
      verificationStatus: VerificationStatus.APPROVED,
      isAvailable: true,
    };

    const [data, total] = await Promise.all([
      PriestProfile.find(query)
        .select(PUBLIC_SELECT)
        .populate({ path: 'user', select: 'name avatar address phone' })
        .sort({ 'rating.average': -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      PriestProfile.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Get a single priest's public profile by ID.
   * Never returns bankDetails.
   */
  static async getPublicProfile(priestId: string): Promise<LeanDoc> {
    if (!mongoose.isValidObjectId(priestId)) {
      throw new AppError('Invalid priest profile ID', 400);
    }

    const priest = await PriestProfile.findById(priestId)
      .select(PUBLIC_SELECT)
      .populate({
        path: 'user',
        select: 'name avatar address.city address.state phone',
      })
      .lean();

    if (!priest) {
      throw new AppError('Priest not found', 404);
    }

    if (priest.verificationStatus !== VerificationStatus.APPROVED) {
      throw new AppError('Priest profile is not available', 404);
    }

    return priest;
  }

  /**
   * Get the priest profile ID for a given user ID.
   */
  static async getProfileByUserId(userId: string): Promise<IPriestProfile> {
    const profile = await PriestProfile.findOne({ user: userId });
    if (!profile) {
      throw new AppError('Priest profile not found for this user', 404);
    }
    return profile;
  }

  /**
   * Update the priest's own profile.
   * Only allows updating non-sensitive fields.
   */
  static async updateProfile(
    priestProfileId: string,
    userId: string,
    updates: Record<string, unknown>
  ): Promise<LeanDoc> {
    const profile = await PriestProfile.findById(priestProfileId);
    if (!profile) {
      throw new AppError('Priest profile not found', 404);
    }

    // Ownership check
    if (profile.user.toString() !== userId) {
      throw new AppError('You can only update your own profile', 403);
    }

    const updated = await PriestProfile.findByIdAndUpdate(
      priestProfileId,
      { $set: updates },
      { new: true, runValidators: true, select: PUBLIC_SELECT }
    )
      .populate({ path: 'user', select: 'name avatar address.city address.state' })
      .lean();

    if (!updated) {
      throw new AppError('Failed to update profile', 500);
    }

    return updated;
  }

  /**
   * Update priest's services and pricing.
   */
  static async updateServices(
    priestProfileId: string,
    userId: string,
    services: Record<string, unknown>[]
  ): Promise<LeanDoc> {
    const profile = await PriestProfile.findById(priestProfileId);
    if (!profile) {
      throw new AppError('Priest profile not found', 404);
    }

    // Ownership check
    if (profile.user.toString() !== userId) {
      throw new AppError('You can only update your own services', 403);
    }

    const updated = await PriestProfile.findByIdAndUpdate(
      priestProfileId,
      { $set: { services } },
      { new: true, runValidators: true, select: PUBLIC_SELECT }
    ).lean();

    if (!updated) {
      throw new AppError('Failed to update services', 500);
    }

    return updated;
  }
}

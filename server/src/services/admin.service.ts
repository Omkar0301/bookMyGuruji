import mongoose from 'mongoose';
import { PriestProfile } from '../models/priestProfile.model';
import { User, IUser } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Notification } from '../models/notification.model';
import { Email } from './email.service';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import {
  UserRole,
  BookingStatus,
  VerificationStatus,
  PaymentStatus,
  DisputeResolution,
} from '../constants/enums';

export class AdminService {
  // ────────────────────────────────────────────────────────────────
  // PRIEST VERIFICATION
  // ────────────────────────────────────────────────────────────────

  /**
   * Get all pending priest verifications with bank details masked.
   */
  static async getPendingVerifications() {
    const verifications = await PriestProfile.find({
      verificationStatus: VerificationStatus.PENDING,
    })
      .select('+bankDetails.accountNumber')
      .populate('user', 'name email phone')
      .sort({ createdAt: 1 })
      .lean();

    return verifications.map((doc) => {
      const v = doc as Record<string, unknown>;
      v.id = String(v._id);
      delete v._id;
      delete v.__v;
      if (v.bankDetails && typeof v.bankDetails === 'object') {
        const bank = v.bankDetails as Record<string, unknown>;
        if (typeof bank.accountNumber === 'string') {
          const acc = bank.accountNumber;
          bank.accountNumber = acc.length >= 4 ? `****${acc.slice(-4)}` : '****';
        }
      }
      return v;
    });
  }

  /**
   * Approve a priest's verification and notify them.
   */
  static async approvePriest(priestId: string) {
    const priest = await PriestProfile.findById(priestId).populate('user');
    if (!priest) throw new AppError('Priest not found', 404);

    priest.verificationStatus = VerificationStatus.APPROVED;
    priest.isAvailable = true;
    await priest.save();

    // Send Email
    const user = priest.user as unknown as IUser;
    const emailService = new Email({ email: user.email, name: user.name }, env.CLIENT_URL);
    await emailService.sendAccountApproved().catch(console.error);

    // In-app Notification
    await Notification.create({
      recipient: user._id,
      type: 'verification_approved',
      title: 'Profile Approved',
      message: 'Your priest profile has been verified and approved.',
      link: '/dashboard',
    });

    return priest;
  }

  /**
   * Reject a priest's verification with a reason and notify them.
   */
  static async rejectPriest(priestId: string, reason: string) {
    if (!reason || reason.length < 10)
      throw new AppError('Reason must be at least 10 characters', 400);

    const priest = await PriestProfile.findById(priestId).populate('user');
    if (!priest) throw new AppError('Priest not found', 404);

    priest.verificationStatus = VerificationStatus.REJECTED;
    priest.verificationNotes = reason;
    await priest.save();

    // Send Email
    const user = priest.user as unknown as IUser;
    const emailService = new Email({ email: user.email, name: user.name }, env.CLIENT_URL);
    await emailService.sendAccountRejected(reason).catch(console.error);

    return priest;
  }

  // ────────────────────────────────────────────────────────────────
  // USER MANAGEMENT
  // ────────────────────────────────────────────────────────────────

  /**
   * Get all users with optional filtering by role, status, and search term.
   */
  static async getUsers(query: Record<string, string>, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) {
      filter.$or = [
        { 'name.first': { $regex: query.search, $options: 'i' } },
        { 'name.last': { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshTokens')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Get a single user by ID.
   */
  static async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password -refreshTokens').lean();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  /**
   * Deactivate a user account.
   */
  static async deactivateUser(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  /**
   * Activate a user account.
   */
  static async activateUser(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  // ────────────────────────────────────────────────────────────────
  // BOOKING MANAGEMENT
  // ────────────────────────────────────────────────────────────────

  /**
   * Get all bookings with optional filtering.
   */
  static async getBookings(query: Record<string, string>, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.priestId) filter.priest = query.priestId;
    if (query.userId) filter.user = query.userId;
    if (query.fromDate && query.toDate) {
      filter.scheduledDate = {
        $gte: new Date(query.fromDate as string),
        $lte: new Date(query.toDate as string),
      };
    }

    const [data, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate({
          path: 'priest',
          populate: { path: 'user', select: 'name' },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Get detailed information for a single booking.
   */
  static async getBookingById(bookingId: string) {
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate({
        path: 'priest',
        populate: { path: 'user', select: 'name email phone' },
      })
      .lean();
    if (!booking) throw new AppError('Booking not found', 404);
    return booking;
  }

  /**
   * Forcefully override the status of a booking (Admin only).
   */
  static async overrideBookingStatus(bookingId: string, status: string, adminNote: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    booking.status = status as BookingStatus;
    booking.statusHistory.push({
      status,
      updatedAt: new Date(),
      note: adminNote || 'Status forced by admin',
    });

    await booking.save();
    return booking;
  }

  // ────────────────────────────────────────────────────────────────
  // DISPUTE RESOLUTION
  // ────────────────────────────────────────────────────────────────

  /**
   * Get all disputed bookings along with their payment history.
   */
  static async getDisputes(): Promise<Record<string, unknown>[]> {
    const disputes = await Booking.find({ status: BookingStatus.DISPUTED })
      .populate('user', 'name email phone')
      .populate({
        path: 'priest',
        populate: { path: 'user', select: 'name email phone' },
      })
      .lean();

    // Fetch payments for these disputes
    const bookingIds = disputes.map((d) => d._id);
    const payments = await Payment.find({ booking: { $in: bookingIds } }).lean();

    const disputesWithPayments = disputes.map((d) => {
      const dPayments = payments.filter(
        (p) => String((p as Record<string, unknown>).booking) === String(d._id)
      );
      return { ...d, payments: dPayments };
    });

    return disputesWithPayments;
  }

  /**
   * Resolve a disputed booking and handle refunds or payouts based on the resolution.
   */
  static async resolveDispute(
    bookingId: string,
    resolution: string,
    adminNote: string,
    userRefundPercent?: number
  ) {
    const booking = await Booking.findById(bookingId).populate('user').populate('priest');
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status !== BookingStatus.DISPUTED)
      throw new AppError('Booking is not in disputed state', 400);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      let finalStatus: BookingStatus = BookingStatus.COMPLETED;

      if (resolution === DisputeResolution.FAVOUR_USER) {
        // Full refund
        finalStatus = BookingStatus.CANCELLED;
        booking.cancellation = {
          cancelledBy: 'admin',
          reason: adminNote,
          refundAmount: booking.pricing.totalAmount, // Assuming total paid is refunded
          cancelledAt: new Date(),
        };
        // Payment logic to initiate Razorpay refund would go here
      } else if (resolution === DisputeResolution.FAVOUR_PRIEST) {
        // Mark balance as released
        finalStatus = BookingStatus.COMPLETED;
        const priestProfile = await PriestProfile.findById(booking.priest).session(session);
        if (priestProfile) {
          priestProfile.totalEarnings += booking.pricing.totalAmount - booking.pricing.platformFee;
          await priestProfile.save({ session });
        }
      } else if (resolution === DisputeResolution.SPLIT) {
        if (userRefundPercent === undefined || userRefundPercent < 0 || userRefundPercent > 100) {
          throw new AppError('Invalid userRefundPercent for split resolution', 400);
        }
        finalStatus = BookingStatus.CANCELLED;
        booking.cancellation = {
          cancelledBy: 'admin',
          reason: adminNote,
          refundAmount: (booking.pricing.totalAmount * userRefundPercent) / 100,
          cancelledAt: new Date(),
        };
        // Partial Priest payout logic would go here
      } else {
        throw new AppError('Invalid resolution type', 400);
      }

      booking.status = finalStatus;
      booking.statusHistory.push({
        status: finalStatus,
        updatedAt: new Date(),
        note: `Dispute resolved: ${resolution}. ${adminNote}`,
      });

      await booking.save({ session });

      // Notify parties
      await Notification.insertMany(
        [
          {
            recipient: booking.user,
            type: 'dispute_resolved',
            title: 'Dispute Resolved',
            message: `Your dispute for booking ${booking.bookingNumber} has been resolved.`,
            link: `/bookings/${booking._id}`,
          },
          {
            recipient:
              (booking.priest as unknown as Record<string, unknown>).user ||
              (await PriestProfile.findById(booking.priest))?.user,
            type: 'dispute_resolved',
            title: 'Dispute Resolved',
            message: `The dispute for booking ${booking.bookingNumber} has been resolved by admin.`,
            link: `/priest/bookings/${booking._id}`,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return booking;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ────────────────────────────────────────────────────────────────

  /**
   * Get high-level overview metrics for the admin dashboard.
   */
  static async getOverviewAnalytics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalPriests,
      pendingVerifications,
      totalBookings,
      bookingsByStatusAgg,
      totalRevenueAgg,
      platformFeeAgg,
      newUsersThisMonth,
      bookingsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ role: UserRole.USER }),
      PriestProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
      PriestProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
      Booking.countDocuments({}),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: PaymentStatus.CAPTURED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Booking.aggregate([
        { $match: { status: BookingStatus.COMPLETED } },
        { $group: { _id: null, platformFee: { $sum: '$pricing.platformFee' } } },
      ]),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Booking.countDocuments({ scheduledDate: { $gte: firstDayOfMonth } }),
    ]);

    const bookingsByStatus: Partial<Record<BookingStatus, number>> = {
      [BookingStatus.PENDING]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.COMPLETED]: 0,
      [BookingStatus.CANCELLED]: 0,
    };
    bookingsByStatusAgg.forEach((b: { _id: BookingStatus; count: number }) => {
      if (b._id in bookingsByStatus) {
        bookingsByStatus[b._id] = b.count;
      }
    });

    return {
      totalUsers,
      totalPriests,
      pendingVerifications,
      totalBookings,
      bookingsByStatus,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      platformFeeCollected: platformFeeAgg[0]?.platformFee || 0,
      newUsersThisMonth,
      bookingsThisMonth,
    };
  }

  /**
   * Get revenue aggregated by day within a specific date range.
   */
  static async getRevenueAnalytics(fromDate: string, toDate: string) {
    const matchStage: Record<string, unknown> = { status: PaymentStatus.CAPTURED };
    if (fromDate && toDate) {
      matchStage.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const revenueByDay = await Payment.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'bookingInfo',
        },
      },
      { $unwind: { path: '$bookingInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalAmount: { $sum: '$amount' },
          platformFee: { $sum: { $ifNull: ['$bookingInfo.pricing.platformFee', 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalAmount: 1,
          platformFee: 1,
          count: 1,
        },
      },
    ]);

    return revenueByDay;
  }

  /**
   * Get the top earning priests.
   */
  static async getTopPriests(limit: number) {
    const priests = await PriestProfile.find({ verificationStatus: VerificationStatus.APPROVED })
      .sort({ totalEarnings: -1 })
      .limit(limit)
      .populate('user', 'name avatar')
      .lean();
    return priests;
  }
}

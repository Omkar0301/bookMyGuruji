import mongoose from 'mongoose';
import { BookingStatus, UserRole, VerificationStatus } from '../constants/enums';
import { Booking, IBooking } from '../models/booking.model';
import { PriestProfile } from '../models/priestProfile.model';
import { Availability } from '../models/availability.model';
import { AppError } from '../utils/AppError';

const PLATFORM_FEE_PERCENT = 10;

export interface CreateBookingDTO {
  priestId: string;
  ceremony: {
    name: string;
    description?: string;
    duration: number;
  };
  scheduledDate: string | Date;
  scheduledTime: string;
  venue: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: [number, number];
  };
  specialRequests?: string;
  materialsRequired?: string[];
}

export class BookingService {
  static async createBooking(userId: string, data: CreateBookingDTO): Promise<IBooking> {
    const session = await mongoose.startSession();
    let booking;

    try {
      session.startTransaction();

      // 1. Validate priest exists and is approved
      const priest = await PriestProfile.findById(data.priestId).session(session);
      if (
        !priest ||
        priest.verificationStatus !== VerificationStatus.APPROVED ||
        !priest.isAvailable
      ) {
        throw new AppError('Priest is not available for booking', 400);
      }

      const ceremonyDetails = priest.services.find((s) => s.name === data.ceremony.name);
      if (!ceremonyDetails) {
        throw new AppError('Ceremony not offered by this priest', 400);
      }

      // Calculate endTime based on duration
      const durationHours = data.ceremony.duration;
      const [startH, startM] = data.scheduledTime.split(':').map(Number) as [number, number];
      const totalMinutes = startH * 60 + startM + Math.floor(durationHours * 60);
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // 2. ATOMIC SLOT RESERVATION
      // We push a block to Availability overrides to ensure no two people can book the same slot
      const scheduledDate = new Date(data.scheduledDate);
      scheduledDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day

      const updatedAvailability = await Availability.findOneAndUpdate(
        {
          priest: data.priestId,
          // Prevent race condition: ensure this specific slot isn't already blocked
          overrides: {
            $not: {
              $elemMatch: {
                date: scheduledDate,
                type: 'blocked',
                'slots.startTime': data.scheduledTime,
              },
            },
          },
        },
        {
          $push: {
            overrides: {
              date: scheduledDate,
              type: 'blocked',
              slots: [{ startTime: data.scheduledTime, endTime }],
              reason: 'Booked Ceremony',
            },
          },
        },
        { new: true, session }
      );

      if (!updatedAvailability) {
        throw new AppError('This time slot has just been booked or is unavailable', 409);
      }

      // 3. Calculate pricing
      const baseAmount = ceremonyDetails.basePriceINR;
      const platformFee = baseAmount * (PLATFORM_FEE_PERCENT / 100);
      const totalAmount = baseAmount + platformFee;
      const advancePaid = totalAmount * 0.3; // 30% advance
      const balanceDue = totalAmount - advancePaid;

      // 4. Generate bookingNumber (handled in pre-save hook of the schema automatically)

      // 5. Create booking with status=BookingStatus.PENDING
      const newBooking = new Booking({
        user: userId,
        priest: data.priestId,
        ceremony: {
          name: data.ceremony.name,
          description: data.ceremony.description || ceremonyDetails.description,
          duration: data.ceremony.duration,
        },
        scheduledDate: scheduledDate,
        scheduledTime: data.scheduledTime,
        venue: data.venue,
        specialRequests: data.specialRequests || '',
        materialsRequired: data.materialsRequired || [],
        pricing: {
          baseAmount,
          platformFee,
          totalAmount,
          advancePaid,
          balanceDue,
        },
        status: BookingStatus.PENDING,
      });

      booking = await newBooking.save({ session });

      // 6. Save statusHistory entry - pre-save hook does this automatically on creation

      // 7. Send notification to priest (in-app + email) about new booking request
      // NotificationService.notifyPriest(booking); // Stubbed

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return booking;
  }

  static async getMyBookings(
    userId: string,
    userRole: string,
    priestProfileId?: string
  ): Promise<IBooking[]> {
    if (userRole === UserRole.PRIEST && priestProfileId) {
      return Booking.find({ priest: priestProfileId })
        .sort('-createdAt')
        .populate(UserRole.USER, 'name email')
        .lean() as unknown as IBooking[];
    }
    return Booking.find({ user: userId })
      .sort('-createdAt')
      .populate(UserRole.PRIEST, 'user bio')
      .lean() as unknown as IBooking[];
  }

  static async getBookingById(bookingId: string): Promise<IBooking> {
    const booking = (await Booking.findById(bookingId)
      .populate(UserRole.USER, 'name email phone')
      .populate({
        path: UserRole.PRIEST,
        populate: { path: UserRole.USER, select: 'name email phone' },
      })
      .lean()) as unknown as IBooking;
    if (!booking) throw new AppError('Booking not found', 404);
    return booking;
  }

  static async confirmBooking(bookingId: string, priestProfileId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.priest.toString() !== priestProfileId) {
      throw new AppError('You are not authorized to confirm this booking', 403);
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError(`Cannot confirm a booking that is ${booking.status}`, 400);
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.statusHistory.push({
      status: BookingStatus.CONFIRMED,
      updatedAt: new Date(),
      note: 'Priest accepted the booking',
    });

    await booking.save();
    return booking;
  }

  static async declineBooking(
    bookingId: string,
    priestProfileId: string,
    reason: string
  ): Promise<IBooking> {
    const session = await mongoose.startSession();
    let booking;

    try {
      session.startTransaction();

      booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new AppError('Booking not found', 404);

      if (booking.priest.toString() !== priestProfileId) {
        throw new AppError('You are not authorized to decline this booking', 403);
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new AppError(`Cannot decline a booking that is ${booking.status}`, 400);
      }

      booking.status = BookingStatus.CANCELLED;
      booking.statusHistory.push({
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
        note: `Declined by priest: ${reason}`,
      });

      booking.cancellation = {
        cancelledBy: UserRole.PRIEST,
        reason,
        refundAmount: booking.pricing.advancePaid, // 100% refund
        cancelledAt: new Date(),
      };

      await booking.save({ session });

      // Free up the slot in Availability
      await Availability.updateOne(
        { priest: priestProfileId },
        {
          $pull: {
            overrides: {
              date: booking.scheduledDate,
              type: 'blocked',
              'slots.startTime': booking.scheduledTime,
            },
          },
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return booking;
  }

  static async completeBooking(bookingId: string, priestProfileId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.priest.toString() !== priestProfileId) {
      throw new AppError('You are not authorized to complete this booking', 403);
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.IN_PROGRESS
    ) {
      throw new AppError(`Cannot complete a booking that is ${booking.status}`, 400);
    }

    booking.status = BookingStatus.COMPLETED;
    booking.statusHistory.push({
      status: BookingStatus.COMPLETED,
      updatedAt: new Date(),
      note: 'Priest marked ceremony as completed',
    });

    await booking.save();
    return booking;
  }

  static async cancelBooking(
    bookingId: string,
    userId: string,
    role: string,
    priestProfileId: string | null,
    reason: string
  ): Promise<IBooking> {
    const session = await mongoose.startSession();
    let booking;

    try {
      session.startTransaction();

      booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new AppError('Booking not found', 404);

      let cancelledBy = UserRole.USER;
      if (role === UserRole.PRIEST) {
        if (booking.priest.toString() !== priestProfileId) {
          throw new AppError('Forbidden', 403);
        }
        cancelledBy = UserRole.PRIEST;
      } else if (role === UserRole.USER) {
        if (booking.user.toString() !== userId) {
          throw new AppError('Forbidden', 403);
        }
        cancelledBy = UserRole.USER;
      } else if (role === UserRole.ADMIN) {
        cancelledBy = UserRole.ADMIN;
      }

      if (
        [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.DISPUTED].includes(
          booking.status
        )
      ) {
        throw new AppError(`Booking is already ${booking.status}`, 400);
      }

      let refundAmount = 0;

      if (cancelledBy === UserRole.PRIEST || cancelledBy === UserRole.ADMIN) {
        // Priest or admin cancels -> full refund
        refundAmount = booking.pricing.advancePaid;
      } else {
        // User cancels -> calc based on time
        const now = new Date();
        const ceremonyDate = new Date(booking.scheduledDate);
        const [hh, mm] = booking.scheduledTime.split(':').map(Number) as [number, number];
        ceremonyDate.setHours(hh, mm, 0, 0);

        const diffTime = ceremonyDate.getTime() - now.getTime();
        const diffHours = diffTime / (1000 * 60 * 60);

        if (diffHours > 48) {
          refundAmount = booking.pricing.advancePaid; // 100% refund
        } else if (diffHours > 24) {
          refundAmount = booking.pricing.advancePaid * 0.5; // 50% refund
        } else {
          refundAmount = 0; // No refund
        }
      }

      booking.status = BookingStatus.CANCELLED;
      booking.statusHistory.push({
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
        note: `Cancelled by ${cancelledBy}: ${reason}`,
      });

      booking.cancellation = {
        cancelledBy,
        reason,
        refundAmount,
        cancelledAt: new Date(),
      };

      await booking.save({ session });

      // Release the slot in availability
      await Availability.updateOne(
        { priest: booking.priest },
        {
          $pull: {
            overrides: {
              date: booking.scheduledDate,
              type: 'blocked',
              'slots.startTime': booking.scheduledTime,
            },
          },
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return booking;
  }

  static async disputeBooking(
    bookingId: string,
    userId: string,
    role: string,
    priestProfileId: string | null,
    reason: string
  ): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (role === UserRole.USER && booking.user.toString() !== userId) {
      throw new AppError('Forbidden', 403);
    }
    if (role === UserRole.PRIEST && booking.priest.toString() !== priestProfileId) {
      throw new AppError('Forbidden', 403);
    }

    booking.status = BookingStatus.DISPUTED;
    booking.statusHistory.push({
      status: BookingStatus.DISPUTED,
      updatedAt: new Date(),
      note: `Dispute raised by ${role}: ${reason}`,
    });

    await booking.save();
    return booking;
  }

  static async getAllBookings(
    page: number,
    limit: number
  ): Promise<{ data: IBooking[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Booking.find()
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate(UserRole.USER, 'name email phone')
        .populate({
          path: UserRole.PRIEST,
          populate: { path: UserRole.USER, select: 'name email' },
        })
        .lean() as unknown as IBooking[],
      Booking.countDocuments(),
    ]);

    return { data, total };
  }
}

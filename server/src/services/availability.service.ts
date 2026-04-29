import moment from 'moment';
import { BookingStatus } from '../constants/enums';
import { Availability, ITimeSlot } from '../models';
import { Booking } from '../models';
import { AppError } from '../utils';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

interface AvailableSlot {
  startTime: string;
  endTime: string;
}

interface AvailableSlotsResult {
  [date: string]: AvailableSlot[];
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Convert "HH:mm" to total minutes from midnight using moment.
 */
function timeToMinutes(time: string): number {
  const m = moment(time, 'HH:mm');
  return m.hours() * 60 + m.minutes();
}

/**
 * Convert total minutes from midnight to "HH:mm" using moment.
 */
function minutesToTime(minutes: number): string {
  return moment().startOf('day').add(minutes, 'minutes').format('HH:mm');
}

/**
 * Check if two time ranges overlap.
 * Range A: [startA, endA)  Range B: [startB, endB)
 */
function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

/**
 * Subtract a booking's time range from a list of available slots.
 * Returns the remaining free slots after removing the occupied range.
 */
function subtractBooking(
  slots: AvailableSlot[],
  bookingStart: number,
  bookingEnd: number
): AvailableSlot[] {
  const result: AvailableSlot[] = [];

  for (const slot of slots) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    if (!rangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd)) {
      // No overlap — keep entire slot
      result.push(slot);
    } else {
      // Overlap — carve out the booking window
      if (slotStart < bookingStart) {
        // Left remainder
        result.push({
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(bookingStart),
        });
      }
      if (slotEnd > bookingEnd) {
        // Right remainder
        result.push({
          startTime: minutesToTime(bookingEnd),
          endTime: minutesToTime(slotEnd),
        });
      }
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────

export class AvailabilityService {
  /**
   * Get available slots for a priest over a date range.
   *
   * Algorithm:
   * 1. Fetch priest's Availability document
   * 2. Fetch confirmed/pending/in_progress bookings in the date range
   * 3. For each date in range:
   *    a. Check if date has an override:
   *       - If type='blocked': skip this date entirely
   *       - If type='available': use override slots
   *       - Otherwise: use weeklySchedule for that dayOfWeek
   *    b. Subtract overlapping bookings (accounting for ceremony duration)
   *    c. Only return future slots at least 2 hours from now
   * 4. Return { "2024-12-25": [{ startTime, endTime }, ...], ... }
   */
  static async getAvailableSlots(
    priestId: string,
    fromDate: string,
    toDate: string
  ): Promise<AvailableSlotsResult> {
    // 1. Fetch availability document
    const availability = await Availability.findOne({
      priest: priestId,
    }).lean();

    if (!availability) {
      throw new AppError('Availability not configured for this priest', 404);
    }

    // 2. Parse date range with moment
    const from = moment.utc(fromDate, 'YYYY-MM-DD').startOf('day');
    const to = moment.utc(toDate, 'YYYY-MM-DD').endOf('day');

    // Fetch blocking bookings in the date range
    const bookings = await Booking.find({
      priest: priestId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
      scheduledDate: { $gte: from.toDate(), $lte: to.toDate() },
    })
      .select('scheduledDate scheduledTime ceremony.duration')
      .lean();

    // Build a lookup: dateStr → array of { startMin, endMin }
    const bookingsByDate: Record<string, { startMin: number; endMin: number }[]> = {};
    for (const booking of bookings) {
      const dateStr = moment.utc(booking.scheduledDate).format('YYYY-MM-DD');
      const startMin = timeToMinutes(booking.scheduledTime);
      const durationHours = booking.ceremony?.duration ?? 1;
      const endMin = startMin + durationHours * 60;

      if (!bookingsByDate[dateStr]) {
        bookingsByDate[dateStr] = [];
      }
      bookingsByDate[dateStr].push({ startMin, endMin });
    }

    // Build overrides lookup: dateStr → override
    const overridesMap: Record<string, { type: 'blocked' | 'available'; slots: ITimeSlot[] }> = {};
    for (const override of availability.overrides) {
      const dateStr = moment.utc(override.date).format('YYYY-MM-DD');
      overridesMap[dateStr] = { type: override.type, slots: override.slots };
    }

    // Build weeklySchedule lookup: dayOfWeek → slots
    const weeklyMap: Record<number, ITimeSlot[]> = {};
    for (const entry of availability.weeklySchedule) {
      weeklyMap[entry.dayOfWeek] = entry.slots;
    }

    // 3. Iterate over each date in range using moment
    const result: AvailableSlotsResult = {};
    const now = moment();
    const twoHoursFromNow = moment().add(2, 'hours');
    const cursor = from.clone();

    while (cursor.isSameOrBefore(to, 'day')) {
      const dateStr = cursor.format('YYYY-MM-DD');
      const dayOfWeek = cursor.day(); // 0=Sun … 6=Sat

      // 3a. Determine raw slots for this date
      let rawSlots: AvailableSlot[] = [];

      if (overridesMap[dateStr]) {
        const override = overridesMap[dateStr];
        if (override.type === 'blocked') {
          // Skip entirely
          cursor.add(1, 'day');
          continue;
        }
        // type === 'available' — use override slots
        rawSlots = override.slots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        }));
      } else if (weeklyMap[dayOfWeek]) {
        rawSlots = weeklyMap[dayOfWeek].map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        }));
      }

      // 3b. Subtract existing bookings
      let availableSlots = [...rawSlots];
      const dayBookings = bookingsByDate[dateStr] || [];
      for (const b of dayBookings) {
        availableSlots = subtractBooking(availableSlots, b.startMin, b.endMin);
      }

      // 3c. Filter out past slots (must be ≥ 2 hours from now)
      const todayStr = now.format('YYYY-MM-DD');
      if (dateStr === todayStr) {
        const cutoffMin = twoHoursFromNow.hours() * 60 + twoHoursFromNow.minutes();
        availableSlots = availableSlots
          .map((slot) => {
            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);
            if (slotEnd <= cutoffMin) return null; // Entire slot is past
            if (slotStart < cutoffMin) {
              // Trim the start to the cutoff
              return { startTime: minutesToTime(cutoffMin), endTime: slot.endTime };
            }
            return slot;
          })
          .filter((s): s is AvailableSlot => s !== null);
      } else if (cursor.isBefore(now, 'day')) {
        // Date is in the past — skip
        cursor.add(1, 'day');
        continue;
      }

      if (availableSlots.length > 0) {
        result[dateStr] = availableSlots;
      }

      cursor.add(1, 'day');
    }

    return result;
  }

  /**
   * Update (replace) the weekly schedule for a priest.
   */
  static async updateWeeklySchedule(
    priestId: string,
    weeklySchedule: { dayOfWeek: number; slots: ITimeSlot[] }[]
  ): Promise<unknown> {
    const availability = await Availability.findOneAndUpdate(
      { priest: priestId },
      { $set: { weeklySchedule } },
      { new: true, upsert: true, runValidators: true }
    );

    return availability;
  }

  /**
   * Add or update an availability override for a specific date.
   */
  static async addOverride(
    priestId: string,
    overrideData: {
      date: string;
      type: 'blocked' | 'available';
      slots: ITimeSlot[];
      reason: string;
    }
  ): Promise<unknown> {
    const overrideDate = moment.utc(overrideData.date, 'YYYY-MM-DD').startOf('day').toDate();

    // Remove existing override for same date, then add the new one
    await Availability.findOneAndUpdate(
      { priest: priestId },
      {
        $pull: { overrides: { date: overrideDate } },
      },
      { new: true, upsert: true }
    );

    // Now push the new override
    const updated = await Availability.findOneAndUpdate(
      { priest: priestId },
      {
        $push: {
          overrides: {
            date: overrideDate,
            type: overrideData.type,
            slots: overrideData.slots,
            reason: overrideData.reason,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Failed to update availability override', 500);
    }

    return updated;
  }
}

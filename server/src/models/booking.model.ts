import mongoose, { Schema, Document, Model } from 'mongoose';
import { BookingStatus } from '../constants/enums';

// ────────────────────────────────────────────────────────────────
// Sub-interfaces
// ────────────────────────────────────────────────────────────────

export interface ICeremony {
  name: string;
  description: string;
  duration: number;
}

export interface IVenue {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: number[];
}

export interface IPricing {
  baseAmount: number;
  platformFee: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
}

export interface IStatusHistoryEntry {
  status: string;
  updatedAt: Date;
  note: string;
}

export interface ICancellation {
  cancelledBy: string;
  reason: string;
  refundAmount: number;
  cancelledAt: Date;
}

// ────────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────────

export interface IBooking extends Document {
  bookingNumber: string;
  user: mongoose.Types.ObjectId;
  priest: mongoose.Types.ObjectId;
  ceremony: ICeremony;
  scheduledDate: Date;
  scheduledTime: string;
  venue: IVenue;
  pricing: IPricing;
  status: BookingStatus;
  statusHistory: IStatusHistoryEntry[];
  cancellation: ICancellation;
  specialRequests: string;
  materialsRequired: string[];
  review: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    priest: {
      type: Schema.Types.ObjectId,
      ref: 'PriestProfile',
      required: [true, 'Priest reference is required'],
      index: true,
    },
    ceremony: {
      name: {
        type: String,
        required: [true, 'Ceremony name is required'],
        trim: true,
      },
      description: { type: String, trim: true, default: '' },
      duration: {
        type: Number,
        required: [true, 'Ceremony duration is required'],
        min: [0.5, 'Duration must be at least 30 minutes'],
      },
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'],
    },
    venue: {
      address: { type: String, required: [true, 'Venue address is required'], trim: true },
      city: { type: String, required: [true, 'Venue city is required'], trim: true },
      state: { type: String, required: [true, 'Venue state is required'], trim: true },
      pincode: { type: String, required: [true, 'Venue pincode is required'], trim: true },
      coordinates: { type: [Number], default: [0, 0] },
    },
    pricing: {
      baseAmount: { type: Number, required: true, min: [0, 'Base amount cannot be negative'] },
      platformFee: { type: Number, required: true, min: [0, 'Platform fee cannot be negative'] },
      totalAmount: { type: Number, required: true, min: [0, 'Total amount cannot be negative'] },
      advancePaid: { type: Number, default: 0, min: 0 },
      balanceDue: { type: Number, default: 0, min: 0 },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BookingStatus),
        message: '{VALUE} is not a valid booking status',
      },
      default: BookingStatus.PENDING,
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String, trim: true, default: '' },
      },
    ],
    cancellation: {
      cancelledBy: { type: String, trim: true },
      reason: { type: String, trim: true },
      refundAmount: { type: Number, min: 0 },
      cancelledAt: { type: Date },
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
      default: '',
    },
    materialsRequired: { type: [String], default: [] },
    review: { type: Schema.Types.ObjectId, ref: 'Review' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

// ────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────

bookingSchema.index({ bookingNumber: 1 }, { unique: true });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ priest: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// ────────────────────────────────────────────────────────────────
// Pre-save: generate booking number + initial status history
// ────────────────────────────────────────────────────────────────

bookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `PBS-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date(),
      note: 'Booking created',
    });
  }

  next();
});

// ────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────

export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);

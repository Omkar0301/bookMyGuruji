import mongoose, { Schema, Document, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────────
// Sub-interfaces
// ────────────────────────────────────────────────────────────────

export interface ITimeSlot {
  startTime: string; // "09:00"
  endTime: string; // "13:00"
}

export interface IWeeklyScheduleEntry {
  dayOfWeek: number; // 0=Sun … 6=Sat
  slots: ITimeSlot[];
}

export interface IOverride {
  date: Date;
  type: 'blocked' | 'available';
  slots: ITimeSlot[];
  reason: string;
}

// ────────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────────

export interface IAvailability extends Document {
  priest: mongoose.Types.ObjectId;
  weeklySchedule: IWeeklyScheduleEntry[];
  overrides: IOverride[];
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
    },
  },
  { _id: false }
);

const weeklyScheduleSchema = new Schema<IWeeklyScheduleEntry>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: [0, 'Day of week must be 0–6'],
      max: [6, 'Day of week must be 0–6'],
    },
    slots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  { _id: false }
);

const overrideSchema = new Schema<IOverride>(
  {
    date: {
      type: Date,
      required: [true, 'Override date is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['blocked', 'available'],
        message: '{VALUE} is not a valid override type',
      },
      required: true,
    },
    slots: {
      type: [timeSlotSchema],
      default: [],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const availabilitySchema = new Schema<IAvailability>(
  {
    priest: {
      type: Schema.Types.ObjectId,
      ref: 'PriestProfile',
      required: [true, 'Priest reference is required'],
      unique: true,
    },
    weeklySchedule: {
      type: [weeklyScheduleSchema],
      default: [],
    },
    overrides: {
      type: [overrideSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────

availabilitySchema.index({ priest: 1 }, { unique: true });

// ────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────

export const Availability: Model<IAvailability> = mongoose.model<IAvailability>(
  'Availability',
  availabilitySchema
);

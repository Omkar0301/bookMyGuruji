import mongoose, { Schema, Document, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────────

export interface IReview extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  priest: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  isVisible: boolean;
  adminNote: string;
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────

const reviewSchema = new Schema<IReview>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      unique: true,
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },
    body: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review body cannot exceed 2000 characters'],
      default: '',
    },
    isVisible: { type: Boolean, default: true },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ priest: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });

// ────────────────────────────────────────────────────────────────
// Post-save hook: update PriestProfile rating
// ────────────────────────────────────────────────────────────────

reviewSchema.post('save', async function () {
  const PriestProfile = mongoose.model('PriestProfile');

  const result = await mongoose.model('Review').aggregate([
    { $match: { priest: this.priest, isVisible: true } },
    {
      $group: {
        _id: '$priest',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    const { average, count } = result[0]!;
    await PriestProfile.findByIdAndUpdate(this.priest, {
      'rating.average': Math.round(average * 10) / 10,
      'rating.count': count,
    });
  }
});

// ────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────

export const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);

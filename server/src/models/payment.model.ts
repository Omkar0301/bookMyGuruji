import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentStatus, PaymentType } from '../constants/enums';

// ────────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────────

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  refund: {
    refundId: string;
    amount: number;
    reason: string;
    initiatedAt: Date;
  };
  createdAt: Date;
}

// ────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: { type: String, default: 'INR', uppercase: true },
    type: {
      type: String,
      enum: {
        values: Object.values(PaymentType),
        message: '{VALUE} is not a valid payment type',
      },
      required: [true, 'Payment type is required'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(PaymentStatus),
        message: '{VALUE} is not a valid payment status',
      },
      default: PaymentStatus.PENDING,
    },
    refund: {
      refundId: { type: String },
      amount: { type: Number, min: 0 },
      reason: { type: String, trim: true },
      initiatedAt: { type: Date },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        delete ret.razorpaySignature;
        return ret;
      },
    },
  }
);

// ────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────

paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

// ────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

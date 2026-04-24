import mongoose, { Schema, Document, Model } from 'mongoose';

// ────────────────────────────────────────────────────────────────
// Sub-interfaces
// ────────────────────────────────────────────────────────────────

export interface ICertificate {
  name: string;
  url: string;
  verified: boolean;
}

export interface IService {
  name: string;
  description: string;
  basePriceINR: number;
  duration: number; // hours
  includesMaterials: boolean;
}

export interface IBankDetails {
  accountHolder: string;
  accountNumber: string; // encrypted
  ifscCode: string;
  upiId: string;
}

// ────────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────────

export interface IPriestProfile extends Document {
  user: mongoose.Types.ObjectId;
  bio: string;
  specialisations: string[];
  languages: string[];
  experience: number;
  education: string;
  certificates: ICertificate[];
  gallery: string[];
  services: IService[];
  travelRadius: number;
  serviceAreas: string[];
  rating: { average: number; count: number };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes: string;
  bankDetails: IBankDetails;
  totalEarnings: number;
  pendingPayout: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────

const priestProfileSchema = new Schema<IPriestProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
      default: '',
    },
    specialisations: {
      type: [String],
      default: [],
      // e.g. ['Vivah', 'Griha Pravesh', 'Satyanarayan Katha', 'Mundan', 'Havan']
    },
    languages: {
      type: [String],
      default: [],
      // e.g. ['Hindi', 'Sanskrit', 'Gujarati']
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    education: {
      type: String,
      trim: true,
      default: '',
    },
    certificates: [
      {
        name: { type: String, trim: true },
        url: { type: String }, // Cloudinary URL
        verified: { type: Boolean, default: false },
      },
    ],
    gallery: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    services: [
      {
        name: {
          type: String,
          required: [true, 'Service name is required'],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          default: '',
        },
        basePriceINR: {
          type: Number,
          required: [true, 'Base price is required'],
          min: [0, 'Price cannot be negative'],
        },
        duration: {
          type: Number,
          min: [0.5, 'Duration must be at least 30 minutes'],
          default: 1,
        },
        includesMaterials: {
          type: Boolean,
          default: false,
        },
      },
    ],
    travelRadius: {
      type: Number, // km
      min: [0, 'Travel radius cannot be negative'],
      default: 25,
    },
    serviceAreas: {
      type: [String], // Pin codes or city names
      default: [],
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      trim: true,
      default: '',
    },
    bankDetails: {
      accountHolder: { type: String, trim: true, default: '' },
      accountNumber: { type: String, select: false, default: '' }, // encrypted
      ifscCode: { type: String, trim: true, default: '' },
      upiId: { type: String, trim: true, default: '' },
    },
    totalEarnings: { type: Number, default: 0, min: 0 },
    pendingPayout: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        // Never expose bank account number in API responses
        if (ret.bankDetails) {
          const bankDetails = ret.bankDetails as Record<string, unknown>;
          delete bankDetails.accountNumber;
        }
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

priestProfileSchema.index({ verificationStatus: 1 });
priestProfileSchema.index({ 'rating.average': -1 });
priestProfileSchema.index({ specialisations: 1 });
priestProfileSchema.index({ isAvailable: 1 });
priestProfileSchema.index({ serviceAreas: 1 });

// ────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────

export const PriestProfile: Model<IPriestProfile> = mongoose.model<IPriestProfile>(
  'PriestProfile',
  priestProfileSchema
);

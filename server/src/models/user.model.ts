import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ────────────────────────────────────────────────────────────────
// Interface
// ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  id: string;
  name: { first: string; last: string };
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'priest' | 'admin';
  avatar: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: string;
      coordinates: number[];
    };
  };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  wishlist: mongoose.Types.ObjectId[];
  refreshTokens: string[];
  googleId?: string;
  otp: { code?: string; expiresAt?: Date };
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ────────────────────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    name: {
      first: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [100, 'First name cannot exceed 100 characters'],
      },
      last: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [100, 'Last name cannot exceed 100 characters'],
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'priest', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    avatar: {
      type: String, // Cloudinary URL
      default: '',
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'PriestProfile' }],
    refreshTokens: {
      type: [String],
      select: false,
    },
    googleId: { type: String, sparse: true },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.otp;
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

userSchema.index({ 'address.location': '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ────────────────────────────────────────────────────────────────
// Pre-save hooks
// ────────────────────────────────────────────────────────────────

/**
 * Hash password before saving — only if the password field was modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ────────────────────────────────────────────────────────────────
// Instance methods
// ────────────────────────────────────────────────────────────────

/**
 * Compare a candidate password with the stored hashed password.
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

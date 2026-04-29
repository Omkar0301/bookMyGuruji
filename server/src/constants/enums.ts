export enum UserRole {
  USER = 'user',
  PRIEST = 'priest',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentType {
  ADVANCE = 'advance',
  BALANCE = 'balance',
  REFUND = 'refund',
}

export enum DisputeResolution {
  FAVOUR_USER = 'favour_user',
  FAVOUR_PRIEST = 'favour_priest',
  SPLIT = 'split',
}

export enum AvailabilityStatus {
  BLOCKED = 'blocked',
  AVAILABLE = 'available',
}

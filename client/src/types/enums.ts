export enum UserRole {
  USER = 'user',
  PRIEST = 'priest',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  ONGOING = 'ongoing',
  PAID = 'paid',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum CeremonyType {
  WEDDING = 'Wedding',
  PUJA = 'Puja',
  HAVAN = 'Havan',
  NAMKARAN = 'Namkaran',
  GRIHA_PRAVESH = 'Griha Pravesh',
  LAST_RITES = 'Last Rites',
}

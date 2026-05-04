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

export enum CeremonyType {
  WEDDING = 'Wedding',
  PUJA = 'Puja',
  HAVAN = 'Havan',
  NAMKARAN = 'Namkaran',
  GRIHA_PRAVESH = 'Griha Pravesh',
  LAST_RITES = 'Last Rites',
}

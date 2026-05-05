import { BookingStatus, PaymentStatus } from './enums';

export interface IBooking {
  id: string;
  bookingNumber: string;
  user: {
    id: string;
    name: { first: string; last: string };
    email: string;
    phone: string;
    avatar?: string;
  };
  priest: {
    id: string;
    user: {
      name: { first: string; last: string };
      email: string;
      phone: string;
      avatar?: string;
    };
  };
  ceremony: {
    name: string;
    duration: number;
    description: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  venue: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: [number, number];
  };
  pricing: {
    basePrice: number;
    materialsPrice: number;
    travelFee: number;
    totalAmount: number;
    commission: number;
    priestEarnings: number;
  };
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  declineReason?: string;
  cancelReason?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

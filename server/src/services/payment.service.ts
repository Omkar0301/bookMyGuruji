import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { Booking } from '../models/booking.model';
import { BookingStatus } from '../constants/enums';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || '',
  key_secret: env.RAZORPAY_KEY_SECRET || '',
});

export class PaymentService {
  static async createOrder(bookingId: string): Promise<Record<string, unknown>> {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError('Booking is not in a state that requires payment', 400);
    }

    const options = {
      amount: Math.round(booking.pricing.advancePaid * 100), // amount in paise
      currency: 'INR',
      receipt: booking.bookingNumber,
    };

    try {
      const order = await razorpay.orders.create(options);

      booking.payment.orderId = order.id;
      await booking.save();

      return order as unknown as Record<string, unknown>;
    } catch (error) {
      console.error('Razorpay Order Error:', error);
      throw new AppError('Failed to create payment order', 500);
    }
  }

  static async verifyPayment(
    bookingId: string,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<boolean> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      booking.payment.paymentId = razorpay_payment_id;
      booking.payment.signature = razorpay_signature;
      booking.payment.status = 'captured';

      // Update booking status if needed, or keep as PENDING until priest confirms?
      // Usually payment confirmation moves it to a state where priest can see it as "paid"
      booking.statusHistory.push({
        status: booking.status,
        updatedAt: new Date(),
        note: 'Advance payment received successfully',
      });

      await booking.save();
      return true;
    } else {
      booking.payment.status = 'failed';
      await booking.save();
      throw new AppError('Invalid payment signature', 400);
    }
  }
}

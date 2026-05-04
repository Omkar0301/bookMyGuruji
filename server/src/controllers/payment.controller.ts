import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { successResponse, errorResponse } from '../utils/response';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  static createOrder = catchAsync(async (req: Request, res: Response) => {
    const { bookingId } = req.body;
    if (!bookingId) return errorResponse(res, 'Booking ID is required', 400);

    const order = await PaymentService.createOrder(bookingId);
    return successResponse(res, order, 'Payment order created');
  });

  static verifyPayment = catchAsync(async (req: Request, res: Response) => {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 'Missing payment verification details', 400);
    }

    await PaymentService.verifyPayment(bookingId, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return successResponse(res, null, 'Payment verified successfully');
  });
}

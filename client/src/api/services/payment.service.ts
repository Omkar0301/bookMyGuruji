import axiosInstance from '../axiosInstance';

export interface IRazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export const paymentApi = {
  createOrder: (data: {
    bookingId: string;
  }): Promise<{ data: { success: boolean; data: IRazorpayOrder } }> =>
    axiosInstance.post('/payments/create-order', data),
  verifyPayment: (data: {
    bookingId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ data: { success: boolean; message: string } }> =>
    axiosInstance.post('/payments/verify', data),
};

export default paymentApi;

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-order', protect, PaymentController.createOrder);
router.post('/verify', protect, PaymentController.verifyPayment);

export default router;

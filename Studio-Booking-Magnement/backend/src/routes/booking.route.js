const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const bookingSchemas = require('../schemas/booking.schema');

// Middleware hỗ trợ đính kèm role vào req (giả lập để controller dùng dễ hơn)
const attachRole = async (req, res, next) => {
  // Lấy role từ profile nếu chưa có (authMiddleware đã set req.user)
  const supabase = require('../config/supabase');
  const { data } = await supabase.from('profiles').select('role').eq('id', req.user.id).single();
  req.user_role = data ? data.role : 'customer';
  next();
};

// ================= Public / Customer Routes =================
router.post(
  '/', 
  authMiddleware, 
  validate(bookingSchemas.createBookingSchema), 
  bookingController.createBooking
);

router.get(
  '/me', 
  authMiddleware, 
  bookingController.getMyBookings
);

router.patch(
  '/:id/payment-claim',
  authMiddleware,
  validate(bookingSchemas.bookingIdParamSchema),
  bookingController.claimPayment
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  attachRole,
  validate(bookingSchemas.cancelBookingSchema),
  bookingController.cancelBooking
);

router.get(
  '/:id', 
  authMiddleware, 
  attachRole,
  validate(bookingSchemas.bookingIdParamSchema), 
  bookingController.getBookingById
);

// ================= Admin Routes =================
router.get(
  '/', 
  authMiddleware, 
  adminMiddleware, 
  bookingController.getAllBookings
);

router.patch(
  '/:id/confirm-payment',
  authMiddleware,
  adminMiddleware,
  validate(bookingSchemas.bookingIdParamSchema),
  bookingController.confirmPayment
);

router.patch(
  '/:id/checkin',
  authMiddleware,
  adminMiddleware,
  validate(bookingSchemas.bookingIdParamSchema),
  bookingController.checkIn
);

router.patch(
  '/:id/no-show',
  authMiddleware,
  adminMiddleware,
  validate(bookingSchemas.bookingIdParamSchema),
  bookingController.noShow
);

module.exports = router;

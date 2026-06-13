const bookingService = require('../services/booking.service');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const user_id = req.user.id;
      const result = await bookingService.createBooking(user_id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const user_id = req.user.id;
      const bookings = await bookingService.getMyBookings(user_id);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req, res, next) {
    try {
      const bookings = await bookingService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      // Nếu là customer, kiểm tra quyền sở hữu
      if (req.user_role !== 'admin' && booking.user_id !== req.user.id) {
         return res.status(403).json({ error: 'Không có quyền truy cập', code: 'FORBIDDEN' });
      }
      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async claimPayment(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const booking = await bookingService.claimPayment(id, user_id);
      res.json({ message: 'Xác nhận chuyển khoản thành công', booking });
    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req, res, next) {
    try {
      const { id } = req.params;
      const admin_id = req.user.id;
      const booking = await bookingService.confirmPayment(id, admin_id);
      res.json({ message: 'Đã xác nhận cọc', booking });
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const { id } = req.params;
      const admin_id = req.user.id;
      const booking = await bookingService.checkIn(id, admin_id);
      res.json({ message: 'Đã check-in thành công', booking });
    } catch (error) {
      next(error);
    }
  }

  async noShow(req, res, next) {
    try {
      const { id } = req.params;
      const admin_id = req.user.id;
      const booking = await bookingService.noShow(id, admin_id);
      res.json({ message: 'Đã đánh dấu khách vắng mặt (No-show)', booking });
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const { reason } = req.body;
      const role = req.user_role; // Đã được gắn vào middleware
      
      const booking = await bookingService.cancelBooking(id, role, user_id, reason);
      res.json({ message: 'Đã hủy booking', booking });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();

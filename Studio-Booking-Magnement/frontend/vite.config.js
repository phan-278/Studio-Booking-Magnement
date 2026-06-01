import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'features/auth/login.html'),
        register: resolve(__dirname, 'features/auth/register.html'),
        booking: resolve(__dirname, 'features/booking/new-booking.html'),
        dashboard: resolve(__dirname, 'features/user/dashboard.html'),
        myBookings: resolve(__dirname, 'features/user/my-bookings.html'),
        admin: resolve(__dirname, 'features/admin/index.html'),
      }
    }
  }
});

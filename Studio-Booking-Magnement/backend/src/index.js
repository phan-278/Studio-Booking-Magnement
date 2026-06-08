require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running correctly!' });
});

// Import Routes
const studioRoutes = require('./routes/studio.route');
const equipmentRoutes = require('./routes/equipment.route');
// const bookingRoutes = require('./routes/booking.route');

// Use Routes
app.use('/api/studios', studioRoutes);
app.use('/api/equipments', equipmentRoutes);
// app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Bắt đầu server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

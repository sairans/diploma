const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const groundRoutes = require('./routes/groundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const app = express();
app.use(express.json());
app.use('/api/grounds', groundRoutes);
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', reviewRoutes);
dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

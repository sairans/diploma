const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const groundRoutes = require('./routes/groundRoutes');
app.use('/api/grounds', groundRoutes);
app.use('/api/bookings', require('./routes/bookingRoutes'));
dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
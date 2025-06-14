const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ground: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ground',
      required: true
    },
    fieldNumber: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: [
      {
        type: String,
        required: true
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

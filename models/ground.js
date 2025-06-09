const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'sport ground',
      required: false
    },
    type: {
      type: String,
      enum: ['football', 'basketball', 'volleyball', 'tennis', 'other'],
      required: true
    },
    pricePerHour: Number,
    available: {
      type: Boolean,
      default: true
    },
    availableWeekdays: {
      type: [Number], // 0=Воскресенье, 1=Понедельник, ..., 6=Суббота
      default: [0, 1, 2, 3, 4, 5, 6] // Пн–Пт
    },
    images: {
      type: [String],
      default: ['https://example.com/placeholder-image.jpg'],
      required: false
    },
    fields: [
      {
        number: { type: Number, required: true, default: 1 },
        name: { type: String, required: false, default: 'Main Field' },
        available: { type: Boolean, default: true }
      }
    ],
    availableHours: {
      start: {
        type: String, // Use 'HH:mm' format (24h) — e.g., '09:00'
        required: true
      },
      end: {
        type: String, // e.g., '17:00'
        required: true
      }
    },
    contacts: {
      instagram: { type: String, required: false },
      phone: { type: String, required: false }
    },
    info: {
      size: { type: String, required: true },
      cover: { type: String, required: true },
      balls: { type: String, default: 'paid' }
    }
  },
  { timestamps: true }
);

groundSchema.index({ location: '2dsphere' });
module.exports =
  mongoose.models.Ground || mongoose.model('Ground', groundSchema);

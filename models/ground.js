const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  type: {
    type: String,
    enum: ['football', 'basketball', 'volleyball'],
    required: true,
  },
  pricePerHour: Number,
  available: {
    type: Boolean,
    default: true,
  },
  availableHours: {
    start: {
      type: String, // Use 'HH:mm' format (24h) — e.g., '09:00'
      required: true
    },
    end: {
      type: String, // e.g., '17:00'
      required: true
    }
  }
  
}, { timestamps: true });

groundSchema.index({ location: '2dsphere' });
module.exports = mongoose.models.Ground || mongoose.model('Ground', groundSchema);
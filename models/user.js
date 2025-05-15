const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: 'https://example.com/default-avatar.png'
    },
    payments: {
      type: [
        {
          cardholderName: { type: String, required: true },
          cardNumber: { type: String, required: true },
          expiryDate: { type: String, required: true },
          brand: { type: String },
          last4: { type: String }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

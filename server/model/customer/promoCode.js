const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null  // applicable for percentage-based discounts
  },
  usageLimit: {
    type: Number,
    default: 0  // 0 = unlimited uses
  },
  usedCount: {
    type: Number,
    default: 0
  },
  userUsageLimit: {
    type: Number,
    default: 1  // number of times a single user can use
  },
  usersUsed: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    usageCount: {
      type: Number,
      default: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isOnlyForValidUser:{
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("PromoCode", promoCodeSchema);

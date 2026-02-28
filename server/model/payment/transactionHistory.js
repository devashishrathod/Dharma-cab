const mongoose = require('mongoose');

const transactionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'passenger',
    required: true,
  },
  paymentId: {
    type: String, // Razorpay payment ID or internal payment reference
    required: true,
  },
  orderId: {
    type: String, // Razorpay order ID (optional)
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'processing', 'paid', 'failed', 'refunded'],
    default: 'created',
  },
  method: {
    type: String, // upi, card, netbanking, wallet etc.
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  purpose: {
    type: String, // e.g., "contest entry", "wallet recharge", "subscription"
  },
  reference: {
    type: String, // reference ID from gateway or internal
  },
  details: {
    type: Object,
    default: {},
  },
},{timestamps:true});

module.exports = mongoose.model('TransactionHistory', transactionHistorySchema);

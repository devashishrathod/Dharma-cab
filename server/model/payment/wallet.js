const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming you have a User model
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  debitAmount:{
   type: Number,
   default: 0
  },
  creditAmount:{
   type: Number,
   default: 0
  },

}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);

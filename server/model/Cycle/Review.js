// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'car',  },
  cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'cycle',  },
  bike: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike',  },
  taxi: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi',  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);

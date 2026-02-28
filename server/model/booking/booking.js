const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rideCategory: {
    type: String,
    required: true
  },
  pickupLocation: {
    address: { type: String },
    city: { type: String },
    latitude: Number, 
    longitude: Number
  },
  destinationLocation: {
    address: String, 
    distance:Number, 
    latitude: Number, 
    longitude: Number
  },
  distance: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true,
    default:Date.now
  },
  bookingTime: {
    type: String,
    required: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['waiting for pickup', 'ongoing', 'completed', 'cancelled'],
    default: 'waiting for pickup'
  },
  rideStatus:{
    type: String,
    enum: ['ridePicked',  'rideNotPicked'],
    default: 'rideNotPicked'
  },
  rejectMessage:{
    type:String,
    default:"Not Yet"
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'car',
    default:null
  },
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    default:null
  },
  taxi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taxi',
    default:null
  },
  cycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cycle',
    default:null
  },
  payableAmount: {
    type: Number,
    // required: true
  },
  type: {
    type: String,
    required: true
  },
  uniqueId: {
    type: String,
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'driver'],
  },
  bookingOtp:{
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

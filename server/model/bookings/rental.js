const mongoose = require('mongoose')

const mongoose_schema = new mongoose.Schema({
    // rideCategory: { type: String },//rental
    pickupCity: { type: String },
    pickupLocation: { type: String },
    pickupDate: { type: String },
    endDate: { type: String },
    totalDays: { type: Number },
    payableAmount: { type: Number },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref:'passenger' },
    carId: { type: mongoose.Schema.Types.ObjectId , ref:"car"},
    bookingDate: { type: Date, default: Date.now }
})


module.exports = mongoose.model('rental-bookings', mongoose_schema)
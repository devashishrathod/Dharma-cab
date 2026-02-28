const mongoose = require("mongoose");

const riderBookingSchema = new mongoose.Schema({
    rideCategory: { type: String },
    //   booking details
    pickupLocation: {
        address: { type: String },
        city: { type: String }
    },
    destinationLocation: { type: String },
    distance: { type: String },
    duration: { type: String },
    bookingDate: { type: String },
    bookingTime: { type: String },
    placeId: { type: String, default: "0000" },
    // bookingStatus
    bookingStatus: { type: String, default: "waiting for pickup" },
    //waiting for pickup->req sent from passenger and looking for cab rider
    //in transit-> cab rider has accepted booking
    //cancel-> passenger or cab rider cancelled the booking
    //passsenger and rider ids
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "passenger" },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "rider" },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "car" },
});

const riderBookingModel = mongoose.model("riderBooking", riderBookingSchema);
module.exports = riderBookingModel;
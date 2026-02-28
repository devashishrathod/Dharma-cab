const mongoose = require("mongoose");
const AirportBooking = require("../model/bookings/airport");
const RiderBooking = require("../model/bookings/bikeRider");
const CityBooking = require("../model/bookings/city");
const OutStationBooking = require("../model/bookings/outStation");
const RentalBooking = require("../model/bookings/rental");
const Car = require("../model/cars/car");
const Bike = require("../model/Bike/Bike");
const Taxi = require("../model/Taxi/Taxi");
const Cycle = require("../model/Cycle/Cycle");
const booking = require("../model/booking/booking");



exports.confirmBooking = async (req, res) => {
  try {
    const {
      currentLocation,
      destination,
      rideType, // car, bike, cycle, taxi
      vehicleId,
      bookingDate,
      bookingTime,
      promoCode,
      duration,
      distance,
      type
    } = req.body;

    const userId = req.accountId; // Authenticated user ID from token

    // Validate ride type and fetch vehicle details
    let vehicleDetails;
    switch (rideType) {
      case "car":
        vehicleDetails = await Car.findById(vehicleId);
        break;
      case "bike":
        vehicleDetails = await Bike.findById(vehicleId);
        break;
      case "cycle":
        vehicleDetails = await Cycle.findById(vehicleId);
        break;
      case "taxi":
        vehicleDetails = await Taxi.findById(vehicleId);
        break;
      default:
        return res.status(400).json({ error: "Invalid ride type provided." });
    }

    if (!vehicleDetails) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    // Calculate charges (example: per km or per hour logic)
    const charges = (distance * vehicleDetails.dailyRate) / 100; // Example logic
    const payableAmount = promoCode ? charges * 0.9 : charges; // 10% discount for promo code

    // Create a booking record
    const bookingData = {
      rideCategory: rideType,
      pickupLocation: currentLocation,
      destinationLocation: destination,
      distance,
      duration,
      bookingDate,
      bookingTime,
      passengerId: userId,
      bookingStatus: "waiting for pickup",
      carId: vehicleId,
      payableAmount,
      type
    };

    let bookingModel;
    if (rideType === "car" || rideType === "taxi") {
      bookingModel = await CityBooking.create(bookingData);
    } else if (rideType === "bike") {
      bookingModel = await RiderBooking.create(bookingData);
    } else if (rideType === "cycle") {
      bookingModel = await RentalBooking.create(bookingData);
    }

    // Update vehicle availability to "Booked"
    vehicleDetails.availability = "Booked";
    await vehicleDetails.save();

    res.status(201).json({
      message: "Booking confirmed successfully.",
      bookingDetails: bookingModel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while booking the ride." });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query; // "upcoming", "completed", "canceled"
    const userId = req.accountId; // Authenticated user ID from token

    // Validate status
    const validStatuses = ["upcoming", "completed", "canceled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status provided." });
    }

    // Define status filter logic
    let statusFilter;
    switch (status) {
      case "upcoming":
        statusFilter = { bookingStatus: { $in: ["waiting for pickup", "ongoing"] } };
        break;
      case "completed":
        statusFilter = { bookingStatus: "completed" };
        break;
      case "canceled":
        statusFilter = { bookingStatus: "canceled" };
        break;
    }

    // Fetch bookings based on ride categories
    const bookings = await Promise.all([
      AirportBooking.find({ passengerId: userId, ...statusFilter }).populate({
        path: "carId",
        select: "manufacturer model carNo imgUrl seatingCapacity luggageCapacity dailyRate monthlyRate availability",
      }),
      RiderBooking.find({ passengerId: userId, ...statusFilter }).populate({
        path: "carId",
        select: "manufacturer model carNo imgUrl seatingCapacity luggageCapacity dailyRate monthlyRate availability",
      }),
      CityBooking.find({ passengerId: userId, ...statusFilter }).populate({
        path: "carId",
        select: "manufacturer model carNo imgUrl seatingCapacity luggageCapacity dailyRate monthlyRate availability",
      }),
      OutStationBooking.find({ passengerId: userId, ...statusFilter }).populate({
        path: "carId",
        select: "manufacturer model carNo imgUrl seatingCapacity luggageCapacity dailyRate monthlyRate availability",
      }),
      RentalBooking.find({ passengerId: userId, ...statusFilter }).populate({
        path: "carId",
        select: "manufacturer model carNo imgUrl seatingCapacity luggageCapacity dailyRate monthlyRate availability",
      }),
    ]);
    

    const flattenedBookings = bookings.flat(); // Combine bookings from all categories

    res.status(200).json({
      message: `${status} bookings retrieved successfully.`,
      bookings: flattenedBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while fetching bookings." });
  }
};


exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;               // Get booking ID from URL
    const { status,rejectMessage,rideStatus } = req.body;             // Get new status from body
    // Validate input
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }
    // Find and update booking by ID
    const updatedBooking = await booking.findByIdAndUpdate(
      id,
      { bookingStatus:status,rejectMessage },
      { new: true }                          // Return the updated document
    );
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found." });
    }
    res.status(200).json({message: `Booking status updated successfully.`,data: updatedBooking})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while updating booking status." });
  }
};

exports.updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    // Find booking by ID
    console.log(id)
    const bookingData = await booking.findById(id);

    if (!bookingData) {
      return res.status(404).json({ error: "Booking not found." });
    }

    // Compare OTP
    if (bookingData.bookingOtp !== Number(otp)) {
      return res.status(400).json({ error: "OTP is mismatched." });
    }

    // Update ride status and save
    bookingData.rideStatus = "ridePicked";
    await bookingData.save();

    res.status(200).json({
      message: "Booking status updated successfully.",
      data: bookingData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while updating booking status.",
    });
  }
};



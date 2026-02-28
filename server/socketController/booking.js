require("dotenv").config();

const Car = require("../model/cars/car");
const Bike = require("../model/Bike/Bike");
const Taxi = require("../model/Taxi/Taxi");
const Cycle = require("../model/Cycle/Cycle");
const booking = require("../model/booking/booking");
const riderInfo = require("../model/rider/account");
const geolib = require("geolib");
const pricingModel = require("../model/admin/pricing");
const PromoCode = require('../model/customer/promoCode')

const getCyCaleBookingData = async (io, userId, type) => {
  const response = await booking
    .find({ rideCategory: "cycle", bookingStatus: type })
    .populate("cycle");
  io.to(userId + "cycle_booking" + type).emit("cycle_booking_list", response);
};

const getBikeBookingData = async (io, userId, type) => {
  const response = await booking
    .find({ rideCategory: "bike", bookingStatus: type })
    .populate("bike");
  io.to(userId + "bike_booking" + type).emit("bike_booking_list", response);
};

const getCarBookingData = async (io, userId, type) => {
  const response = await booking
    .find({ rideCategory: "car", bookingStatus: type })
    .populate("car");
  io.to(userId + "car_booking" + type).emit("car_booking_list", response);
};

const getTaxiBookingData = async (io, userId, type) => {
  const response = await booking
    .find({ rideCategory: "taxi", bookingStatus: type })
    .populate("taxi");
  io.to(userId + "taxi_booking" + type).emit("taxi_booking_list", response);
};

const handleBooking = async (
  socket,
  io,
  {
    currentLocation,
    destination,
    rideType,
    vehicleId,
    bookingDate,
    bookingTime,
    promoCode,
    duration,
    distance,
    type,
    userId,
  },
  onlineDrivers,
  driverUpdateTimestamps
) => {
  socket.join(userId);
  socket.join(userId+"_booking_Status");

  try {
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
        return socket.emit("booking-response", {
          message: "Invalid ride type provided.",
          success: false,
        });
    }

    if (!vehicleDetails) {
      return socket.emit("booking-response", {
        message: "Vehicle not found.",
        success: false,
      });
    }

  
    const vehiclePricingInfo = await pricingModel.findOne({ vehicleType:rideType });
    const code = await PromoCode.findOne({ code: promoCode.trim(), isActive: true });
    let validPromo = false
    
      
        if (code.expiryDate > new Date() && code &&(code?.validUsers?.includes(userId) || code?.isOnlyForValidUser) &&
        code.usageLimit>code.usedCount 
        ) {
            validPromo=true
        }


          
let payableAmount = distance * vehiclePricingInfo.chargePerKem;

if (validPromo && code) {
  if (code.discountType === "fixed") {
    payableAmount -= code.discountValue;
    code.usedCount+=1
  } else if (code.discountType === "percentage") {
    code.usedCount+=1
    payableAmount -= (payableAmount * code.discountValue) / 100;
  }
}


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
      payableAmount,
      type,
      [rideType]: vehicleId,
      bookingOtp: Math.floor(1000 + Math.random() * 9000)
    };

    const bookingModel = await booking.create(bookingData);
    // vehicleDetails.availability= 'Booked'
    const response = await vehicleDetails.save();
     await code.save()

    const driverInfo = await riderInfo.findById(vehicleDetails.createdBy);

    const locationInfo = driverUpdateTimestamps.get(driverInfo?._id?.toString());



    // Calculate distance (assuming `distanceCalcToPricing` is in meters)
    
    // console.log(locationInfo)

    socket.emit("booking-response", {
      message: "Booking successful.",
      data: bookingModel,
      driverInfo: locationInfo
        ? {
            ...(driverInfo.toObject?.() || driverInfo), // ensure plain object
            lat: locationInfo.latitude,
            long: locationInfo.longitude,
          }
        : driverInfo,
      idDriverOnline:!!locationInfo,  
      
    //   driverDistanceKm: Number(distanceInKm),
    //   driverDistanceMeter: Number(distanceInMeters),
      success: true,
    });
    
    socket.join(`${userId}${rideType}_bookingwaiting for pickup`);

    // Emit booking data to frontend based on ride type
    switch (rideType) {
      case "car":
        getCarBookingData(io, userId, "waiting for pickup");
        break;
      case "bike":
        getBikeBookingData(io, userId, "waiting for pickup");
        break;
      case "cycle":
        getCyCaleBookingData(io, userId, "waiting for pickup");
        break;
      case "taxi":
        getTaxiBookingData(io, userId, "waiting for pickup");
        break;
    }

    const driverId = vehicleDetails.createdBy.toString();

    if (onlineDrivers.has(driverId)) {
      io.to(driverId).emit("booking_popUp", response);
    } else {
      io.to(driverId).emit("booking_popUp_status", {
        message: "No driver available.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    socket.emit("booking-response", {
      message: "Internal server error.",
      success: false,
    });
  }
};
const updateRideStatus = async (io, socket, bookingId, bookingType) => {
 

  try {
  const updatedBooking = await booking.findByIdAndUpdate(
        bookingId,
      { bookingStatus: bookingType },
      { new: true }
    );

    let vehicleSchema;

     switch (updatedBooking.rideCategory) {
      case "car":
        vehicleSchema =  Car;
        break;
      case "bike":
        vehicleSchema =  Bike;
        break;
      case "cycle":
        vehicleSchema =  Cycle;
        break;
      case "taxi":
        vehicleSchema =  Taxi;
        break;
      default:
        return socket.emit("booking-response", {
          message: "Invalid ride type provided.",
          success: false,
        });
    }

    if (!updatedBooking) {
      throw new Error("Booking not found");
    }

    const room = updatedBooking.passengerId.toString() +"_booking_Status";
    socket.join(room);
    const vehicleId =  updatedBooking.car ||  updatedBooking.bike ||updatedBooking.cycle||updatedBooking.taxi
    if(bookingType?.trim()?.toLowerCase()==="ongoing"){
    await vehicleSchema.findByIdAndUpdate(vehicleId,
      { availability: 'Booked' },
      { new: true }
    )
    }else{
      await vehicleSchema.findByIdAndUpdate(vehicleId,
      { availability: 'Available' },
      { new: true }
    )
    }

    const message = bookingType === 'cancelled' ? "Cancel Booking" : "Confirm Booking";

    io.to(room).emit("driver_booking_response", {
      data: updatedBooking,
      message,
      success: true,
    });

    // Leave the room after successful emit
    socket.leave(room);

  } catch (error) {
    // If error happens before updatedBooking is available
    // console.error("updateRideStatus error:", error.message);

    // Optional: use a fallback room or notify globally
    // Only emit if passengerId is known
    if (bookingId) {
      const bookingData = await booking.findById(bookingId);
      const room = bookingData?.passengerId?.toString();
      if (room) {
        io.to(room).emit("driver_booking_response", {
          data: null,
          message: "Failed to update booking status",
          success: false,
        });
      }
    }
  }
};


module.exports = {handleBooking,updateRideStatus};
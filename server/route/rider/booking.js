const router = require("express").Router();
const CityData = require("../../model/data");
const Booking = require("../../model/bookings/rental");
const accountMiddleware = require("../../middleware/account");
const Rider = require("../../model/rider/account");
const socketIo = require("socket.io");
const ChatMessage = require("../../model/chat/bookingChat");
const riderModel = require("../../model/rider/account");
const customerModel = require("../../model/customer/account");
const booking = require("../../model/booking/booking");

// Get current active booking request
// we can make a algorithm for nearest rides, currenltly i am using city range here
router.get("/current-bookings", accountMiddleware, async (req, resp) => {
  // console.log(req.query);
  try {
    const city = req.query.city;
    const bookingData = await Booking.find({
      bookingStatus: "waiting for pickup",
      "pickupLocation.city": city,
    }).populate("passengerId", "name email contact");
    resp.json({
      success: true,
      msg: "Current open Bookings",
      bookingData,
    });
    // console.log(bookingData);
  } catch (err) {
    resp.json({
      success: false,
      msg: err.message,
    });
  }
});

// accept current booking
router.put("/accept-booking", accountMiddleware, async (req, resp) => {
  console.log(req.accountId);
  try {
    const bookingId = req.body.bookingId;
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        bookingStatus: "waiting for pickup",
      },

      {
        bookingStatus: "in transit",
        riderId: req.accountId,
      },
      {
        new: true,
      }
    ).populate("riderId", "name contact vehicleRegistrationNo");
    if (!booking) {
      resp.json({
        success: false,
        msg: "Booking not found",
      });
    }
    resp.json({
      success: true,
      msg: "Booking confirmed",
      booking,
    });
  } catch (err) {
    resp.json({
      success: false,
      msg: err.message,
    });
  }
});

// Cancel cuurent booking
router.put("/cancel-booking", accountMiddleware, async (req, resp) => {
  try {
    const riderId = req.accountId;
    const bookingId = req.body.bookingId;
    const booking = Booking.findOne({
      _id: bookingId,
      riderId: riderId,
    });
    if (!booking) {
      resp.json({
        success: false,
        msg: "Booking not found",
      });
    }
    if (booking.status === "canceled") {
      resp.json({
        success: false,
        msg: "Booking already canceled",
      });
    }
    booking.status = "cancel";
    await booking.save();
    resp.json({
      success: true,
      msg: "Booking canceled",
    });
  } catch (err) {
    resp.json({
      success: false,
      msg: err.message,
    });
  }
});

// Live tracking for rider
router.post("/rider/location-tracking/:id", async (req, resp) => {
  try {
    const { id } = req.params;
    const { lat, long } = req.body;
    const rider = await Rider.findByIdAndUpdate(
      id,
      {
        lat: parseFloat(lat),
        long: parseFloat(long),
      },
      { new: true }
    );
    io.emit("rider-tracking", {
      riderId: rider._id,
      coordinates: rider.coordinates,
    });
  } catch (err) {
    resp.json({
      success: false,
      msg: err.message,
    });
  }
});

router.get('/chat/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    let riderId;
    const messages = await ChatMessage.find({ bookingId }).sort({ timestamp: 1 }).select('senderType _id message timestamp');
    const bookingRes = await booking.findById(bookingId).populate([
     { path: "car", select: "createdBy" },
     { path: "bike", select: "createdBy" },
     { path: "taxi", select: "createdBy" },
     { path: "cycle", select: "createdBy" }
   ])
      riderId = (bookingRes?.car?.createdBy||bookingRes?.bike?.createdBy||
      bookingRes?.taxi?.createdBy||bookingRes?.cycle?.createdBy)?.toString()

    const riderInfo = await riderModel.findById(riderId).select('').select('name email profileImgUrl contact');
    const clientInfo = await customerModel.findById(bookingRes.passengerId).select('name email imgUrl mobileNumber');
  
    res.status(200).json({
      clientInfo:clientInfo,
      riderInfo:riderInfo,
      messages:messages
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

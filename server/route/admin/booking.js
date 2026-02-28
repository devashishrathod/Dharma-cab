const express = require("express");
const router = express.Router();
const accountMiddleware = require('../../middleware/account');
const Booking = require('../../model/booking/booking');

router.get("/vehicle", accountMiddleware, async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,         // e.g., 'completed'
    vehicleType     // e.g., 'car'
  } = req.query;

  const matchStage = {};

  // Optional: filter by status
  if (status) {
    matchStage.bookingStatus = status;
  }

  // Optional: filter by vehicle type
  if (vehicleType) {
    matchStage.rideCategory=vehicleType; // Only bookings that have the vehicle
  }

  try {
    const skip = (page - 1) * limit;

    // 1. Fetch paginated filtered bookings
    const bookings = await Booking.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'passengerId',
          foreignField: '_id',
          as: 'passenger'
        }
      },
      {
        $unwind: {
          path: "$passenger",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      { $skip: Number(skip) },
      { $limit: Number(limit) }
    ]);

    // 2. Get booking status counts
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: "$bookingStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      "waiting for pickup": 0,
      "ongoing": 0,
      "completed": 0,
      "cancelled": 0
    };

    statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });

    const totalCount = await Booking.countDocuments(matchStage);

    res.json({
      success: true,
      total: totalCount,
      statusCount: statusMap,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      data: bookings
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports =router
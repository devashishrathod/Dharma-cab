const booking = require("../model/booking/booking");
const driver = require("../model/rider/account");
const car = require("../model/cars/car");
const bike = require("../model/Bike/Bike");
const taxi = require("../model/Taxi/Taxi");
const cycale = require("../model/Cycle/Cycle");
const handale_Booking_Dashbord = async (socket) => {
  try {
    const ongoingBookings = await booking.find({ bookingStatus: "ongoing" });
    socket.emit("dashboard_booking_Data", ongoingBookings);
  } catch (error) {
    console.error("Dashboard error:", error.message);
    socket.emit("dashboardError", { error: "Failed to load dashboard data" });
  }
};

const handale_Online_Driver = async (io, onlineDrivers) => {
  // if (!Array.isArray(onlineDrivers)) {
  //   console.log(onlineDrivers,"Invalid driver data format")
  //   return socket.emit("dashboardError", { error: "Invalid driver data format" });
  // }

  try {

    const onlineDriverData = await driver.find({ _id: { $in: [...onlineDrivers] } });
    io.to('online_driver_dashbord+').emit("dashboard_Online_Driver", onlineDriverData);
    // console.log(`Sent ${onlineDriverData.length} online drivers to socket ${socket.id}`);
  } catch (error) {
    console.error("Dashboard error:", error.message);
    io.to('online_driver_dashbord+').emit("dashboardError", { 
      error: "Failed to load dashboard data",
      details: error.message 
    });
  }
};


const handale_Booking_Status_Count = async (socket) => {
  try {
    // Vehicle counts
    const cycaleCount = await cycale.countDocuments();    
    const bikeCount = await bike.countDocuments();    
    const taxiCount = await taxi.countDocuments();    
    const carCount = await car.countDocuments();
    
const now = new Date();
const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

// Optional: for debugging
console.log("firstDayOfLastMonth:", firstDayOfLastMonth);
console.log("lastDayOfLastMonth:", lastDayOfLastMonth);
console.log("firstDayOfThisMonth:", firstDayOfThisMonth);

const groupedByStatus = [
  {
    $group: {
      _id: "$bookingStatus",
      totalCount: { $sum: 1 },

      // ✅ Last Month
      lastMonthCount: {
        $sum: {
          $cond: [
            {
              $and: [
                { $gte: ["$bookingDate", firstDayOfLastMonth] },
                { $lte: ["$bookingDate", lastDayOfLastMonth] },
              ],
            },
            1,
            0,
          ],
        },
      },
      lastMonthRevenue: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ["$bookingStatus", "completed"] },
                { $gte: ["$bookingDate", firstDayOfLastMonth] },
                { $lte: ["$bookingDate", lastDayOfLastMonth] },
              ],
            },
            "$payableAmount",
            0,
          ],
        },
      },

      // ✅ This Month
      thisMonthCount: {
        $sum: {
          $cond: [
            { $gte: ["$bookingDate", firstDayOfThisMonth] },
            1,
            0,
          ],
        },
      },
      thisMonthRevenue: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ["$bookingStatus", "completed"] },
                { $gte: ["$bookingDate", firstDayOfThisMonth] },
              ],
            },
            "$payableAmount",
            0,
          ],
        },
      },
    },
  },
]; 

const groupedByStatus1 = [
  {
    $group: {
      _id: "$bookingStatus",
      totalCount: { $sum: 1 },
      lastMonthCount: {
        $sum: {
          $cond: [
            {
              $and: [
                { $gte: ["$bookingDate", firstDayOfLastMonth] },
                { $lte: ["$bookingDate", lastDayOfLastMonth] }
              ]
            },
            1,
            0
          ]
        }
      },
      lastMonthRevenue: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ["$bookingStatus", "completed"] },
                { $gte: ["$bookingDate", firstDayOfLastMonth] },
                { $lte: ["$bookingDate", lastDayOfLastMonth] }
              ]
            },
            "$payableAmount",
            0
          ]
        }
      }
    }
  }
];
// const groupedByStatus1 = [
//       {
//         $facet: {
//           groupedByStatus: [
//             {
//               $group: {
//                 _id: "$bookingStatus",
//                 count: { $sum: 1 },
//                 ongoingRevenue: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$bookingStatus", "completed"] },
//                       "$payableAmount",
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//           ],
//           totalBookings: [{ $count: "total" }],
//           currentMonthCount: [
//             { $match: { createdAt: { $gte: startOfCurrentMonth } } },
//             { $count: "count" }
//           ],
//           lastMonthCount: [
//             { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
//             { $count: "count" }
//           ]
//         },
//       },
//     ]


    // Booking aggregation
    const response = await booking.aggregate(groupedByStatus);

    // Build booking status summary
    const bookingCountObj = {
      cancelled: 0,
      ongoing: 0,
      completed: 0,
      waitingforpickup: 0,
      ongoingRevenue: 0,
    };

    const bookingCount = response[0]?.groupedByStatus?.reduce((acc, el) => {
      acc[el._id?.split(' ').join('')] = el.count;
      acc.ongoingRevenue += el.ongoingRevenue;
      return acc;
    }, bookingCountObj);

    // bookingCount.totalBookings = response[0]?.totalBookings[0]?.total || 0;

    // const currentMonth = response[0]?.currentMonthCount[0]?.count || 0;
    // const lastMonth = response[0]?.lastMonthCount[0]?.count || 0;

    // bookingCount.increasedSinceLastMonth = currentMonth - lastMonth;

    // Emit final data
    socket.emit("booking_status_count", {
      // data: {
      //   cycaleCount,
      //   bikeCount,
      //   taxiCount,
      //   carCount,
      //   bookingCount: bookingCount || bookingCountObj,
      // },
      data:response,
      success: true,
    });

  } catch (error) {
    console.log("Socket Error:", error);
    socket.emit("booking_status_count", {
      data: error.message || error,
      success: false,
    });
  }
};

module.exports = { handale_Booking_Dashbord , handale_Online_Driver ,handale_Booking_Status_Count};

require("dotenv").config();
const jwt = require("jsonwebtoken");
const Driver = require("./model/rider/driverSchema");
const changeStream = Driver.watch();

const Car = require("./model/cars/car");
const Bike = require("./model/Bike/Bike");
const Taxi = require("./model/Taxi/Taxi");
const Cycle = require("./model/Cycle/Cycle");
const RiderBooking = require("./model/bookings/bikeRider");
const CityBooking = require("./model/bookings/city");
const OutStationBooking = require("./model/bookings/outStation");
const RentalBooking = require("./model/bookings/rental");
const booking = require("./model/booking/booking");
const riderInfo = require("./model/rider/account");
const ChatMessage = require("./model/chat/bookingChat");
const geolib = require("geolib");

const { Types } = require("mongoose");
const {handleBooking} = require("./socketController/booking");
const handaleVehicleByStatus = require("./socketController/vehicle");
const { handale_Booking_Dashbord, handale_Online_Driver,handale_Booking_Status_Count } = require("./socketController/dashbord");
const { handle_client_Booking } = require("./socketController/client");
const {  updateRideStatus } = require("./socketController/booking");
const { Socket } = require("socket.io");

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const clients = new Map();
const onlineDrivers = new Set();
const driverUpdateTimestamps = new Map(); // key: userId, value: last update timestamp

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

const getNearByDriver = async () => {
  try {
    // Fetch all drivers (not just the one updated)
    const allDrivers = await Driver.find({}).populate({
      path: "userId",
      select: "name email contact",
    });

    clients.forEach(({ socket, lat: clientLat, lng: clientLng }) => {
      // Filter drivers based on proximity to this client's location
      // const nearbyDrivers = allDrivers
      // .filter(driver => {
      //   if (!driver.location?.coordinates) return false;
      //   const [lng, lat] = driver.location.coordinates;
      //   const distance = getDistance(clientLat, clientLng, lat, lng);
      //   return distance <= 5000; // 5km
      // })
      // Emit the full list of nearby drivers to the client
      // socket.emit('nearbyDriverList', nearbyDrivers);

      const nearbyDrivers = allDrivers
        .filter((driver) => {
          if (!driver?.location?.coordinates) return false;
          const [lng, lat] = driver.location.coordinates;
          const distance = getDistance(clientLat, clientLng, lat, lng);
          console.log(distance);
          return distance <= 5000; // 5km
          // return distance <= 15000000000; // 15000km
        })
        .map((driver) => ({
          ...driver.toObject(),
          isOnline: onlineDrivers.has(driver?.userId?._id.toString()),
        }));

      // Emit the full list of nearby drivers to the client
      socket.emit("nearbyDriverList", nearbyDrivers);
    });
  } catch (err) {
    console.error("Error sending full nearby drivers list:", err);
  }
};

const getRideLiveLocation = async (io, userId, status) => {
  let bookingList = [];
  if (status !== "driver") {
    bookingList = await booking
      .findOne({ bookingStatus: "ongoing", passengerId: userId })
      .populate([
        {
          path: "car",
          select: "createdBy",
          populate: {
            path: "createdBy",
            select: "name email contact riderId profileImgUrl",
          },
        },
        {
          path: "bike",
          select: "createdBy",
          populate: {
            path: "createdBy",
            select: "name email contact riderId profileImgUrl",
          },
        },
        {
          path: "taxi",
          select: "createdBy",
          populate: {
            path: "createdBy",
            select: "name email contact riderId profileImgUrl",
          },
        },
        {
          path: "cycle",
          select: "createdBy",
          populate: {
            path: "createdBy",
            select: "name email contact riderId profileImgUrl",
          },
        },
      ]);
  } else {
    bookingList = await booking.aggregate([
      {
        $match: {
          bookingStatus: "ongoing",
        },
      },
      {
       $lookup:{
          from:"passengers", 
          localField: "passengerId",
          foreignField: "_id",
          as:"clientInfo"
       }
      },
      // Lookup car
      {
        $lookup: {
          from: "cars", // collection name (make sure this matches your DB)
          localField: "car",
          foreignField: "_id",
          as: "car",
          pipeline: [
            { $match: { createdBy: new Types.ObjectId(userId) } },
            { $project: { createdBy: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$car", preserveNullAndEmptyArrays: true },
      },
      // Lookup bike
      {
        $lookup: {
          from: "bikes",
          localField: "bike",
          foreignField: "_id",
          as: "bike",
          pipeline: [
            { $match: { createdBy: new Types.ObjectId(userId) } },
            { $project: { createdBy: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$bike", preserveNullAndEmptyArrays: true },
      },
      // Lookup taxi
      {
        $lookup: {
          from: "taxis",
          localField: "taxi",
          foreignField: "_id",
          as: "taxi",
          pipeline: [
            { $match: { createdBy: new Types.ObjectId(userId) } },
            { $project: { createdBy: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$taxi", preserveNullAndEmptyArrays: true },
      },
      // Lookup cycle
      {
        $lookup: {
          from: "cycles",
          localField: "cycle",
          foreignField: "_id",
          as: "cycle",
          pipeline: [
            { $match: { createdBy: new Types.ObjectId(userId) } },
            { $project: { createdBy: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$cycle", preserveNullAndEmptyArrays: true },
      },
    ]);
  }

  // Attach live driver location
const listToProcess = Array.isArray(bookingList) ? bookingList : [bookingList].filter(Boolean);

const enrichedBookingList = listToProcess.map((el) => {
  const driverObj =
    el?.car?.createdBy ||
    el?.bike?.createdBy ||
    el?.taxi?.createdBy ||
    el?.cycle?.createdBy;

  const locationInfo = driverUpdateTimestamps.get(driverObj?._id?.toString());

  return {
    ...(typeof el?.toObject === "function" ? el.toObject() : el),
    driverCurrentLatLong: locationInfo || null,
    driverInfO: driverObj || null,
  };
});

  io.to(`user_${userId}`).emit("onGoing_Booking_List", {
    data: bookingList ? enrichedBookingList : [],
  });
};

const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    let type;
    let userId;

    try {
      const token = socket.handshake.query.token || socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      userId = decoded._id;
      type = decoded.userStatus;

      console.log(type)
      // console.log(userId);
      if (type !== "customer") {
        onlineDrivers.add(userId);
      } else {
        clients.set(userId, { socket });
      }
            console.log(type,onlineDrivers)


    } catch (err) {
      console.error("JWT verification failed:", err.message);
      socket.emit("auth:error", { message: "Invalid or expired token" });
      return socket.disconnect(true); // Disconnect the socket if auth fails
    }

    socket.on('online_driver_dashbord',()=>{
          socket.join('online_driver_dashbord+')
          handale_Online_Driver(io,onlineDrivers)
    })

    socket.on("booking", (data) => {
      handleBooking(
        socket,
        io,
        { ...data, userId },
        onlineDrivers,
        driverUpdateTimestamps
      );
    });

    socket.on("cycle_booking", async ({ type }) => {
      socket.join(userId + "cycle_booking" + type);
      getCyCaleBookingData(io, userId, type);
    });

    socket.on("bike_booking", async ({ type }) => {
      socket.join(userId + "bike_booking" + type);
      getBikeBookingData(io, userId, type);
    });

    socket.on("car_booking", async ({ type }) => {
      socket.join(userId + "car_booking" + type);
      getCarBookingData(io, userId, type);
    });

    socket.on("taxi_booking", async ({ type }) => {
      socket.join(userId + "taxi_booking" + type);
      getTaxiBookingData(io, userId, type);
    });

    socket.on("updateDriverLocation",async ({ latitude, longitude, heading }) => {
        try {
          if (latitude == null || longitude == null) return;

          const now = Date.now();
          const lastUpdateEntry = driverUpdateTimestamps.get(userId);
          // console.log("lastUpdateEntry", lastUpdateEntry);
          if (!lastUpdateEntry) {
            driverUpdateTimestamps.set(userId, {
              now,
              latitude,
              longitude,
              heading,
            });
          }
          const lastUpdateTime = lastUpdateEntry?.now || 0;

          if (now - lastUpdateTime >= 3 * 60 * 1000) {
            // Save updated timestamp and location in memory
            driverUpdateTimestamps.set(userId, {
              now,
              latitude,
              longitude,
              heading,
            });

            // Save location in DB
            await Driver.findOneAndUpdate(
              { userId },
              {
                $set: {
                  location: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                  },
                  updatedAt: new Date(),
                },
              },
              {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
              }
            );
          } else {
            console.log("Skipping update: 3-minute interval not reached");
          }

          if (now - lastUpdateTime >= 2 * 1000) {
            // 2 seconds
            const bookingList = await booking.aggregate([
              {
                $match: {
                  bookingStatus: "ongoing",
                  // passengerId: new Types.ObjectId(userId),
                },
              },
              // Lookup car
              {
                $lookup: {
                  from: "cars", // collection name (make sure this matches your DB)
                  localField: "car",
                  foreignField: "_id",
                  as: "car",
                  pipeline: [
                    { $match: { createdBy: new Types.ObjectId(userId) } },
                    { $project: { createdBy: 1 } },
                  ],
                },
              },
              {
                $unwind: { path: "$car", preserveNullAndEmptyArrays: true },
              },
              // Lookup bike
              {
                $lookup: {
                  from: "bikes",
                  localField: "bike",
                  foreignField: "_id",
                  as: "bike",
                  pipeline: [
                    { $match: { createdBy: new Types.ObjectId(userId) } },
                    { $project: { createdBy: 1 } },
                  ],
                },
              },
              {
                $unwind: { path: "$bike", preserveNullAndEmptyArrays: true },
              },
              // Lookup taxi
              {
                $lookup: {
                  from: "taxis",
                  localField: "taxi",
                  foreignField: "_id",
                  as: "taxi",
                  pipeline: [
                    { $match: { createdBy: new Types.ObjectId(userId) } },
                    { $project: { createdBy: 1 } },
                  ],
                },
              },
              {
                $unwind: { path: "$taxi", preserveNullAndEmptyArrays: true },
              },
              // Lookup cycle
              {
                $lookup: {
                  from: "cycles",
                  localField: "cycle",
                  foreignField: "_id",
                  as: "cycle",
                  pipeline: [
                    { $match: { createdBy: new Types.ObjectId(userId) } },
                    { $project: { createdBy: 1 } },
                  ],
                },
              },
              {
                $unwind: { path: "$cycle", preserveNullAndEmptyArrays: true },
              },
            ]);
            // Only trigger getRideLiveLocation if at least one vehicle matches
            bookingList.forEach((el) => {
              const hasMatchedVehicle =
                el.car || el.bike || el.taxi || el.cycle;

              if (hasMatchedVehicle && el.passengerId) {
                getRideLiveLocation(io, el.passengerId.toString());
              }
            });
          }
        } catch (err) {
          console.error("Error updating driver location:", err);
        }
      }
    );

    socket.on("registerClientLocation", ({ lat, lng }) => {
      clients.set(userId, { socket, lat, lng });
      getNearByDriver();
    });

    socket.on("disconnect", () => {
      onlineDrivers.delete(userId);
      clients.delete(userId);
    });

    socket.on("admin-to-user", async ({ clientId, message, adminId }) => {
      try {
        await sendMessageToClient(clientId, message, adminId, "admin");
        const messages = await handleJoinRoom(clientId, adminId);
        io.to(clientId).emit("message", { data: messages, success: true });
      } catch (error) {
        io.to(clientId).emit("message-error", {
          from: "admin",
          message: "Failed to send admin message.",
        });
      }
    });

    socket.on("user-to-admin", async ({ clientId, message, adminId }) => {
      try {
        await sendMessageToClient(clientId, message, adminId, "user");
        const messages = await handleJoinRoom(clientId, adminId);
        io.to(clientId).emit("message", { data: messages, success: true });
      } catch (error) {
        io.to(clientId).emit("message-error", {
          from: "user",
          message: "Failed to send user message.",
        });
      }
    });

    socket.on("Vehicle_cordinate", async ({ rideType }) => {
      try {
        let vehicleDetails;
        switch (rideType) {
          case "car":
            vehicleDetails = await Car.find().select(
              "location type availability"
            );
            break;
          case "bike":
            vehicleDetails = await Bike.find().select(
              "location type availability"
            );
            break;
          case "cycle":
            vehicleDetails = await Cycle.find().select(
              "location type availability"
            );
            break;
          case "taxi":
            vehicleDetails = await Taxi.find().select(
              "location type availability"
            );
            break;
          default:
            socket.emit("Vehicle-response", {
              message: "Invalid ride type provided.",
              data: [],
              success: false,
            });
            return;
        }

        if (!vehicleDetails.length) {
          socket.emit("Vehicle-response", {
            message: "Vehicle not found.",
            data: [],
            success: false,
          });
          return;
        }

        socket.emit("Vehicle-response", {
          message: "Vehicle successful.",
          data: vehicleDetails,
          success: true,
        });
      } catch (error) {
        socket.emit("Vehicle-response", {
          message: error.message,
          data: vehicleDetails,
          success: false,
        });
      }
    });

    // b0oking

    socket.on('rider_booking_Update',async ({bookingId})=>{

    })



    socket.on("onGoing_booking", async () => {
      try {
        socket.join(`user_${userId}`);
        getRideLiveLocation(io, userId, "client");
      } catch (error) {
        io.to(`user_${userId}`).emit("onGoing_Booking_error", {
          error: error.message,
        });
      }
    });

    socket.on("onGoing_booking_driver", async () => {
      try {
        socket.join(`user_${userId}`);
        getRideLiveLocation(io, userId, "driver");
      } catch (error) {
        io.to(`user_${userId}`).emit("onGoing_Booking_error", {
          error: error.message,
        });
      }
    });

    socket.on("vehicleByStatus", async ({ type }) => {
      try {
        const data = await handaleVehicleByStatus(type, onlineDrivers);
        socket.emit("vehicleByStatusResult", data); // optional: emit response back to client
      } catch (error) {
        console.error("Error fetching vehicles by status:", error);
        socket.emit("error", { message: "Failed to fetch vehicle data." });
      }
    });

    // Chat

    socket.on("joinBookingChatRoom", ({ bookingId }) => {
      socket.join(bookingId);
      console.log(`User joined room: ${bookingId}`);
    });

    // Handle sending a message
    socket.on("sendMessage", async (data) => {
      const { bookingId, senderType, senderId, message } = data;

      let riderId = senderType === "RIDER" ? userId : "";
      let clientId = senderType !== "RIDER" ? userId : "";
      socket.join(bookingId);

      if (senderType !== "RIDER") {
        const bookingRes = await booking.findById(bookingId).populate([
          { path: "car", select: "createdBy" },
          { path: "bike", select: "createdBy" },
          { path: "taxi", select: "createdBy" },
          { path: "cycle", select: "createdBy" },
        ]);
        riderId = (
          bookingRes?.car?.createdBy ||
          bookingRes?.bike?.createdBy ||
          bookingRes?.taxi?.createdBy ||
          bookingRes?.cycle?.createdBy
        )?.toString();
      }

      if (senderType === "RIDER") {
        const bookingRes = await booking.findById(bookingId);
        clientId = bookingRes.passengerId.toString();
      }
      //   console.log("riderId",riderId)
      // console.log("clientId",clientId)

      const newMessage = new ChatMessage({
        bookingId,
        riderId,
        clientId,
        senderType,
        senderId,
        message,
      });
      await newMessage.save();
      // Broadcast to all users in the same booking room
      io.to(bookingId).emit("receiveMessage", newMessage);
    });

    // dashbord

    socket.on('booking_dashbord',()=>{
      handale_Booking_Dashbord(socket)
    })

    // socket.on('driver_dashbord',()=>{
    //   handale_Online_Driver(socket,onlineDrivers)
    // })

    socket.on('booking_count_dashbord',()=>{
      handale_Booking_Status_Count(socket,onlineDrivers)
    })

    // client booking 
    socket.on('client_booking',({bookingStatus})=>{
      handle_client_Booking(socket,bookingStatus)
    })

    socket.on('update_booking_status',({bookingId,bookingType})=>{
      updateRideStatus(io,socket,bookingId,bookingType)
    })

   socket.on('online_driver', () => {
  try {
    console.log("Online.............................");
    onlineDrivers.add(userId);
    handale_Online_Driver(socket, onlineDrivers);
  } catch (error) {
    console.error("Error in online_driver event:", error);
  }
});

socket.on('offline_driver', (userId) => {  // Fixed typo in event name
  try {
    socket.join('online_driver_dashbord+')
    console.log("Driver went offline:", userId);
    onlineDrivers.delete(userId);
    handale_Online_Driver(io, [...onlineDrivers]); // Convert Set to Array
  } catch (error) {
    console.error("Error in offline_driver event:", error);
  }
});

// Handle when a driver comes online
socket.on("online_driver", (userId) => {  // Added userId parameter
  try {
    socket.join('online_driver_dashbord+')
    console.log("Driver came online:", userId);
    onlineDrivers.add(userId);
    handale_Online_Driver(io, [...onlineDrivers]); // Convert Set to Array
  } catch (error) {
    console.error("Error in online_driver event:", error);
  }
});

    Driver.watch().on("change", async (change) => {
    if (["insert", "update", "replace"].includes(change.operationType)) {
      getNearByDriver();
    }
   });
  })
}

   // DashBord 
;

module.exports = { handleSocketConnection };

// ride accept
// real time Driver update eith location
// Calling Option
// Chat Option
// Alert

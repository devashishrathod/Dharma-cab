const booking = require("../model/booking/booking");

const handle_client_Booking = async (socket, bookingStatus) => {
  try {
    const response = await booking.find({ bookingStatus }).select('');
    socket.emit('client_booking_list', {
      data: response,
      success: true
    });
  } catch (error) {
    console.error("Booking fetch error:", error.message);
    socket.emit('client_booking_error', {
      data: error.message || "Unknown error",
      success: false
    });
  }
};



module.exports = { handle_client_Booking };

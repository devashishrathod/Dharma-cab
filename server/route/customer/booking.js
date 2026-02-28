const router = require("express").Router();
const CityData = require("../../model/data");
const accountMiddleware = require("../../middleware/account");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const RentalBooking = require('../../model/bookings/rental');
const Airport = require('../../model/bookings/airport');
const City = require('../../model/bookings/city');
const BikeRide = require("../../model/bookings/bikeRider")
const OutStation = require("../../model/bookings/outStation");


// get data
router.get("/city-data", async (req, resp) => {
  resp.send(CityData);
});

// search city and find its data
router.post("/search-data", async (req, resp) => {
  console.log(req.query);
  try {
    const citydata = await CityData.findOne({ city: req.query.city });
    resp.send(citydata);
  } catch (err) {
    resp.send(err.message);
  }
});

// Customer booking data
router.post("/booking", accountMiddleware, async (req, resp) => {
  const { rideCategory } = req.body;
  let Model;
  if (!rideCategory) {

    return resp.send('ride category is not mentioned')
  }
  else if (rideCategory === 'rental') {
    Model = RentalBooking

    try {
      const newBooking = await Model.create({
        ...req.body,
        carId: req.body.carId,
        passengerId: req.accountId,
      });
      return resp.json({ success: true, msg: "Booking confirmed", newBooking });
    } catch (err) {
      return resp.send(err.message);
    }
  } else if (rideCategory === 'airport') {
    Model = Airport
    try {
      const newBooking = await Model.create({
        ...req.body,
        passengerId: req.accountId,
      });
      return resp.json({ success: true, msg: "Booking confirmed", newBooking });
    } catch (err) {
      return resp.send(err.message);
    }
  } else if (rideCategory === 'city') {
    Model = City
    try {
      const newBooking = await Model.create({
        ...req.body,
        passengerId: req.accountId,
      });
      return resp.json({ success: true, msg: "Booking confirmed", newBooking });
    } catch (err) {
      return resp.send(err.message);
    }
  } else if (rideCategory === 'bikeRide') {
    Model = BikeRide
    try {
      const newBooking = await Model.create({
        ...req.body,
        passengerId: req.accountId,
      });
      return resp.json({ success: true, msg: "Booking confirmed", newBooking });
    } catch (err) {
      return resp.send(err.message);
    }
  } else if (rideCategory === 'outStation') {
    Model = OutStation
    try {
      const newBooking = await Model.create({
        ...req.body,
        passengerId: req.accountId,
      });
      return resp.json({ success: true, msg: "Booking confirmed", newBooking });
    } catch (err) {
      return resp.send(err.message);
    }
  }


});

// get all bookings
router.get("/get-bookings-data", async (req, resp) => {
  try {
    const results = await Booking.find({})
      .populate("passengerId", "name email contact")
      .populate("riderId", "name contact vehicleRegistrationNo");
    console.log(results);
    resp.send(results);
  } catch (err) {
    resp.send(err.message);
  }
});

//payment
// router.post("/payment", async (req, resp) => {
//   const { amount } = req.body;
//   console.log(amount);
//   try {
//     // const customer = await stripe.customers.create({
//     //   name: "Carry BUG",
//     //   address: {
//     //     line1: "510 St",
//     //     postal_code: "403001",
//     //     city: "PANAJI",
//     //     state: "GOA",
//     //     country: "INDIA",
//     //   },
//     // });
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "us",
//             product_data: {
//               name: "Payment for booking",
//             },
//             unit_amount: amount * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: "http://localhost:4242/success",
//       cancel_url: "http://localhost:4242/cancel",

//       customer_email: "harshada@gmail.com", // You may want to use the customer's email if available
//     });
//     if (session.success_url) {
//       resp.send({ url: session.url });
//     } else {
//       resp.send({ success: error });
//     }
//   } catch (err) {
//     resp.send({ success: false, err });
//   }
// });

router.post("/payment", async (req, resp) => {
  const { amount } = req.body;
  console.log("=>", req.body.amount);
  const lineItems = [
    {
      price_data: {
        currency: "inr",
        product_data: {
          name: "Payment",
        },
        unit_amount: amount * 100,
      },
      quantity: 1,
    },
  ];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
     success_url: "http://localhost:5173",
    // success_url: "https://meru-cabs-delta.vercel.app/",
    cancel_url: "https://localhost:5000/route/response/sucess.html",
  });
  console.log(session.url);
  resp.send({ url: session.url });
  // resp.status(201).json({link: session.url})
});

module.exports = router;

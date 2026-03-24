const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const carRoutes = require("./route/carRoutes");
const bikeRoutes = require("./route/bikeRoutes");
const cycleRoutes = require("./route/cycleRoutes");
const taxiRoutes = require("./route/taxiRoutes");
const bookings = require("./route/bookingRoutes");
const promoCode = require("./route/customer/promoCode")
const aboutus = require("./route/aboutUs/aboutus");
const riderVehicle = require("./route/rider/vehicle")
const pricing = require('./route/admin/pricing')
const adminBooking = require('./route/admin/booking')
const driverRating = require('./route/customer/driverRating')
const vehicleAdmin = require('./route/admin/vehicle')
const favoriteAddress = require('./route//customer/favoriteAddress')
const payment = require('./route/customer/payment/payment')
const wallet = require('./route/customer/payment/wallet')
const referal = require('./route/admin/referal')

app.get("/", async (req, resp) => {
  resp.send("Socket server is running!");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// customer routes
app.use("/api", require("./route/customer/account"));
app.use(require("./route/customer/booking"));
app.use(require("./route/customer/cities"));
app.use("/api", require("./route/customer/profile"));
app.use(require("./route/customer/enquiry"));
app.use(require("./route/customer/partner"));
app.use(require("./route/customer/cars"));
app.use(require("./route/customer/support"));

// // driver routes
app.use('/api/', require("./route/rider/account"));
app.use('/api/', require("./route/rider/booking"));

// // Admin routes
app.use(require("./route/admin/account"));
app.use(require("./route/admin/dailyOffers"))
app.use(require("./route/admin/bankOffers"))
app.use(require("./route/admin/monthlyOffers"))
app.use(require("./route/admin/car"))
app.use(require('./route/admin/rental-bookings'))
app.use(require('./route/admin/dashbord'))
app.use(require("./route/admin/support"));



// Use the routes
app.use("/api/cars", carRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/taxis", taxiRoutes);
app.use("/api/bookings", bookings);
app.use("/api/promoCode", promoCode);
app.use("/api/info", aboutus);
app.use("/api/riderVehicle", riderVehicle);
app.use("/api/admin", vehicleAdmin);
app.use("/api/admin/pricing", pricing);
app.use("/api/admin/booking", adminBooking);
app.use("/api/client/rating", driverRating);
app.use("/api/client/favorite", favoriteAddress);
app.use('/api/payment', payment);
app.use('/api/wallet', wallet);
app.use('/api/referral', referal);




// io.on('connection', function(socket){

// 	console.log('Connected');

// 	socket.on('msg_from_client', function(from,msg){
// 		console.log('Message is '+from, msg);
// 	})
// 	socket.on('disconnect', function(msg){
// 		console.log('Disconnected');
// 	})
// // });
// io.on('connection',(socket) =>{

//   console.log('User Connected');

//   socket.on('disconnect', ()=>{
//     console.log('User Disconnected')
//   })
// })


module.exports = app;

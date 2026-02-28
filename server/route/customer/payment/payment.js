const express = require('express');
const router = express.Router();
const paymentController = require('../../../controller/payment/payment');
const accountMiddleware = require("../../../middleware/account");

// Route to create a Razorpay order
router.post('/create-order',accountMiddleware, paymentController.createOrder);

// Route to verify Razorpay payment
router.post('/verify-payment',accountMiddleware, paymentController.verifyPayment);


router.post('/wallet/pay', accountMiddleware, paymentController.payFromWallet);
router.post('/driver/create-order', accountMiddleware, paymentController.createOrderForDriverPayment);
router.post('/driver/verify-payment', accountMiddleware, paymentController.verifyForDriverPayment);

module.exports = router;

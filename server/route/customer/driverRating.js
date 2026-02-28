require("dotenv").config();
const express = require("express");
const router = express.Router();
const accountMiddleware = require("../../middleware/account");
const { addDriverRating, getDriverReviews } = require("../../controller/driverRating");

// Add enquiry
router.post("/create",accountMiddleware,addDriverRating);
// Get All  enquiry
router.get("/:id",getDriverReviews );

module.exports = router;

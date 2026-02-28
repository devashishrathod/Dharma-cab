const express = require("express");
const router = express.Router();
const bikeController = require("../controller/bikeController");

// Routes for bike management
router.get("/", bikeController.getAllBikes);
router.post("/", bikeController.addBike);
router.get("/detail/:id", bikeController.getBikeById);
router.put("/:id", bikeController.updateBike);
router.delete("/:id", bikeController.deleteBike);

module.exports = router;

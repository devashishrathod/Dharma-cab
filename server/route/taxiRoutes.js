const express = require("express");
const router = express.Router();
const taxiController = require("../controller/taxiController");

// Routes for taxi management
router.get("/", taxiController.getAllTaxis);
router.post("/", taxiController.addTaxi);
router.get("/detail/:id", taxiController.getTaxiById);
router.put("/:id", taxiController.updateTaxi);
router.delete("/:id", taxiController.deleteTaxi);

module.exports = router;

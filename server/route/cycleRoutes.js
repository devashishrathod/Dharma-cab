const express = require("express");
const router = express.Router();
const cycleController = require("../controller/cycleController");

// Routes for cycle management
router.get("/", cycleController.getAllCycles);
router.post("/", cycleController.addCycle);
router.get("/detail/:id", cycleController.getCycleById);
router.put("/:id", cycleController.updateCycle);
router.delete("/:id", cycleController.deleteCycle);

module.exports = router;

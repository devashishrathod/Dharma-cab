// routes/pricingRoutes.js
const express = require("express");
const router = express.Router();
const pricingModel = require("../../model/admin/pricing");

// Create or Update by vehicleType
router.post("/create", async (req, res) => {
  try {
    const { vehicleType } = req.body;
    const existingpricing = await pricingModel.findOne({ vehicleType });

    if (existingpricing) {
      const updated = await pricingModel.findOneAndUpdate(
        { vehicleType },
        req.body,
        { new: true }
      );
      return res.status(200).json({success:true, message: "Updated successfully", data: updated });
    } else {
      const newpricing = new pricingModel(req.body);
      await newpricing.save();
      return res.status(201).json({success:true, message: "Created successfully", data: newpricing });
    }
  } catch (error) {
    return res.status(500).json({ success:false,error: error.message });
  }
});

// Get all pricing entries
router.get("/all-pricing", async (req, res) => {
  try {
    const data = await pricingModel.find();
    res.status(200).json({success:true, data });
  } catch (error) {
    res.status(500).json({success:false, error: error.message });
  }
});

// Delete by vehicleType
router.delete("/pricing/:vehicleType", async (req, res) => {
  try {
    const { vehicleType } = req.params;
    const deleted = await pricingModel.findOneAndDelete({ vehicleType });
    if (!deleted) {
      return res.status(404).json({ message: "Vehicle type not found" });
    }
    res.status(200).json({success:true, message: "Deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({success:false, error: error.message });
  }
});

module.exports = router

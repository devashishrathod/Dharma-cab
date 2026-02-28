const Bike = require("../model/Bike/Bike");

// Get all bikes
exports.getAllBikes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
    const skip = (page - 1) * limit;

    const total = await Bike.countDocuments();
    const Bikees = await Bike.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: Bikees,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  async (req, res) => {
//   try {
//     const bikes = await Bike.find();
//     res.status(200).json({ success: true, data: bikes });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Get a bike by ID
exports.getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, message: "Bike not found" });
    }
    res.status(200).json({ success: true, data: bike });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a bike
exports.addBike = async (req, res) => {
  try {
    const bike = new Bike(req.body);
    await bike.save();
    res.status(201).json({ success: true, data: bike });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a bike
exports.updateBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bike) {
      return res.status(404).json({ success: false, message: "Bike not found" });
    }
    res.status(200).json({ success: true, data: bike });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a bike
exports.deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, message: "Bike not found" });
    }
    res.status(200).json({ success: true, message: "Bike deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Taxi = require("../model/Taxi/Taxi");

// Get all taxis
exports.getAllTaxis =  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
    const skip = (page - 1) * limit;

    const total = await Taxi.countDocuments();
    const Taxies = await Taxi.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: Taxies,
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
}


// Get a taxi by ID
exports.getTaxiById = async (req, res) => {
  try {
    const taxi = await Taxi.findById(req.params.id);
    if (!taxi) {
      return res.status(404).json({ success: false, message: "Taxi not found" });
    }
    res.status(200).json({ success: true, data: taxi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a taxi
exports.addTaxi = async (req, res) => {
  try {
    const taxi = new Taxi(req.body);
    await taxi.save();
    res.status(201).json({ success: true, data: taxi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a taxi
exports.updateTaxi = async (req, res) => {
  try {
    const taxi = await Taxi.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!taxi) {
      return res.status(404).json({ success: false, message: "Taxi not found" });
    }
    res.status(200).json({ success: true, data: taxi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a taxi
exports.deleteTaxi = async (req, res) => {
  try {
    const taxi = await Taxi.findByIdAndDelete(req.params.id);
    if (!taxi) {
      return res.status(404).json({ success: false, message: "Taxi not found" });
    }
    res.status(200).json({ success: true, message: "Taxi deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

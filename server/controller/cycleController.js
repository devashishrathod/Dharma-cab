const Cycle = require("../model/Cycle/Cycle");

// Get all cycles
exports.getAllCycles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
    const skip = (page - 1) * limit;

    const total = await Cycle.countDocuments();
    const cycles = await Cycle.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: cycles,
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

// Get a cycle by ID
exports.getCycleById = async (req, res) => {
  try {
    const cycle = await Cycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ success: false, message: "Cycle not found" });
    }
    res.status(200).json({ success: true, data: cycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a cycle
exports.addCycle = async (req, res) => {
  try {
    const cycle = new Cycle(req.body);
    await cycle.save();
    res.status(201).json({ success: true, data: cycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a cycle
exports.updateCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cycle) {
      return res.status(404).json({ success: false, message: "Cycle not found" });
    }
    res.status(200).json({ success: true, data: cycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a cycle
exports.deleteCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findByIdAndDelete(req.params.id);
    if (!cycle) {
      return res.status(404).json({ success: false, message: "Cycle not found" });
    }
    res.status(200).json({ success: true, message: "Cycle deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

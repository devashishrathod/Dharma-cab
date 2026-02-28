const FavoriteLocation = require("../model/customer/favoriteAddress");

// Add a new favorite location
const addFavoriteLocation = async (req, res) => {
  try {
    const { label, pickup, destination, isDefault } = req.body;
    const userId = req.accountId;

    // Ensure both pickup and destination exist
    if (!pickup || !destination) {
      return res.status(400).json({ error: "Pickup and Destination are required." });
    }

    // If setting as default, unset other defaults for user
    if (isDefault) {
      await FavoriteLocation.updateMany({ userId }, { isDefault: false });
    }

    const newLocation = new FavoriteLocation({
      userId,
      label,
      pickup,
      destination,
      isDefault
    });

    await newLocation.save();
    res.status(201).json({ message: "Favorite location added", data: newLocation });
  } catch (error) {
    res.status(500).json({ error: "Failed to add location", detail: error.message });
  }
};

// Get all favorite locations of a user
const getFavoriteLocations = async (req, res) => {
  try {
    const userId = req.accountId;
    const locations = await FavoriteLocation.find({ userId });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch locations", detail: error.message });
  }
};

// Delete a favorite location
const deleteFavoriteLocation = async (req, res) => {
  try {
    const userId = req.accountId;
    const locationId = req.params.id;

    const deleted = await FavoriteLocation.findOneAndDelete({ _id: locationId, userId });

    if (!deleted) {
      return res.status(404).json({ error: "Location not found or unauthorized" });
    }

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete location", detail: error.message });
  }
};


module.exports = {
  addFavoriteLocation,
  getFavoriteLocations,
  deleteFavoriteLocation,
};

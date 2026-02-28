const express = require("express");
const router = express.Router();
const {
  addFavoriteLocation,
  getFavoriteLocations,
  deleteFavoriteLocation,
} = require("../../controller/favoriteAddress");
const accountMiddleware = require("../../middleware/account");


// Add a new favorite location
router.post("/create", accountMiddleware, addFavoriteLocation);

// Get all favorite locations for the authenticated user
router.get("/all", accountMiddleware, getFavoriteLocations);


// Delete a favorite location
router.delete("/:id", accountMiddleware, deleteFavoriteLocation);

module.exports = router;

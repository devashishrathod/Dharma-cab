require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const accountMiddleware = require("../../middleware/account");
const DailyOffer = require("../../model/offers/dailyOffers");


// Post Daily offers by admin
router.post("/dailyOffers", accountMiddleware, async (req, resp) => {
    try {
        const { title, imageUrl, text } = req.body;

        const newDailyOffer = new DailyOffer({ title, imageUrl, text });
        await newDailyOffer.save();
        resp.json({
            success: true,
            message: "Daily offer created successfully",
            dailyOffer: newDailyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Get Daily offers
router.get("/dailyOffers", async (req, resp) => {
    try {
        const allDailyOffers = await DailyOffer.find();
        resp.json({
            success: true,
            message: "Daily offers",
            dailyOffer: allDailyOffers,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Get Daily offer by ID
router.get("/dailyOffers/:id", async (req, resp) => {
    try {
        const dailyOffer = await DailyOffer.findById(req.params.id);
        if (!dailyOffer) {
            return resp.json({
                success: false,
                message: "Daily offer not found",
            })
        }
        resp.json({
            success: true,
            message: "Daily offers",
            dailyOffer: dailyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});



// Update Daily Offers
router.put("/dailyOffers/:id", accountMiddleware, async (req, resp) => {
    try {
        const { title, imageUrl, text } = req.body;

        const updatedDailyOffer = await DailyOffer.findByIdAndUpdate(
            req.params.id,
            { title, imageUrl, text },
            { new: true }
        );

        if (!updatedDailyOffer) {
            return resp.json({
                success: false,
                message: "Daily offer not found",
            })
        }

        resp.json({
            success: true,
            message: "Daily offers",
            dailyOffer: updatedDailyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Delete the daily offers
router.delete("/dailyOffers/:id", accountMiddleware, async (req, resp) => {
    try {
        const deletedDailyOffer = await DailyOffer.findByIdAndDelete(
            req.params.id
        );

        if (!deletedDailyOffer) {
            return resp.json({
                success: false,
                message: "Daily offer not found",
            })
        }

        resp.json({
            success: true,
            message: "Daily offers",
            dailyOffer: deletedDailyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});

module.exports = router;

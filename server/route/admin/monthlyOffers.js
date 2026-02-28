require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const accountMiddleware = require("../../middleware/account");
const MonthlyOffer = require("../../model/offers/monthlyOffers");


// Post Monthly offers by admin
router.post("/monthlyOffers", accountMiddleware, async (req, resp) => {
    try {
        const { title, imageUrl, text } = req.body;

        const newMonthlyOffer = new MonthlyOffer({ title, imageUrl, text });
        await newMonthlyOffer.save();
        resp.json({
            success: true,
            message: "Monthly offer created successfully",
            monthlyOffer: newMonthlyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Get Monthly offers
router.get("/monthlyOffers", async (req, resp) => {
    try {
        const allMonthlyOffers = await MonthlyOffer.find();
        resp.json({
            success: true,
            message: "Monthly offers",
            monthlyOffer: allMonthlyOffers,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Get Monthly offer by ID
router.get("/monthlyOffers/:id", async (req, resp) => {
    try {
        const monthlyOffer = await MonthlyOffer.findById(req.params.id);
        if (!monthlyOffer) {
            return resp.json({
                success: false,
                message: "Monthly offer not found",
            })
        }
        resp.json({
            success: true,
            message: "Monthly offers",
            monthlyOffer: monthlyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});



// Update Monthly Offers
router.put("/monthlyOffers/:id", accountMiddleware, async (req, resp) => {
    try {
        // console.log("hi for month")
        const { title, imageUrl, text } = req.body;

        const updatedMonthlyOffer = await MonthlyOffer.findByIdAndUpdate(
            req.params.id,
            { title, imageUrl, text },
            { new: true }
        );

        if (!updatedMonthlyOffer) {
            return resp.json({
                success: false,
                message: "Monthly offer not found",
            })
        }

        resp.json({
            success: true,
            message: "Monthly offers",
            monthlyOffer: updatedMonthlyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Delete the monthly\ offers
router.delete("/monthly\Offers/:id", accountMiddleware, async (req, resp) => {
    try {
        const deletedMonthlyOffer = await MonthlyOffer.findByIdAndDelete(
            req.params.id
        );

        if (!deletedMonthlyOffer) {
            return resp.json({
                success: false,
                message: "Monthly offer not found",
            })
        }

        resp.json({
            success: true,
            message: "Monthly offers",
            monthlyOffer: deletedMonthlyOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});

module.exports = router;

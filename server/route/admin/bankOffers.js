require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const accountMiddleware = require("../../middleware/account");
const BankOffer = require("../../model/offers/bankOffers");


// Post Bank offers by admin
router.post("/bankOffers", accountMiddleware, async (req, resp) => {
    try {
        const { title, imageUrl, text } = req.body;

        const newBankOffer = new BankOffer({ title, imageUrl, text });
        await newBankOffer.save();
        resp.json({
            success: true,
            message: "Bank offer created successfully",
            BankOffer: newBankOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Get Bank offers
router.get("/bankOffers", async (req, resp) => {
    try {
        const allBankOffers = await BankOffer.find();
        resp.json({
            success: true,
            message: "Bank offers",
            bankOffer: allBankOffers,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Get Bank offer by ID
router.get("/bankOffers/:id", async (req, resp) => {
    try {
        const bankOffer = await BankOffer.findById(req.params.id);
        if (!bankOffer) {
            return resp.json({
                success: false,
                message: "Bank offer not found",
            })
        }
        resp.json({
            success: true,
            message: "Bank offers",
            bankOffer: bankOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});



// Update Bank Offers
router.put("/bankOffers/:id", accountMiddleware, async (req, resp) => {
    try {
        const { title, imageUrl, text } = req.body;

        const updatedBankOffer = await BankOffer.findByIdAndUpdate(
            req.params.id,
            { title, imageUrl, text },
            { new: true }
        );

        if (!updatedBankOffer) {
            return resp.json({
                success: false,
                message: "Bank offer not found",
            })
        }

        resp.json({
            success: true,
            message: "Bank offers",
            bankOffer: updatedBankOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});


// Delete the bank offers
router.delete("/bankOffers/:id", accountMiddleware, async (req, resp) => {
    try {
        const deletedBankOffer = await BankOffer.findByIdAndDelete(
            req.params.id
        );

        if (!deletedBankOffer) {
            return resp.json({
                success: false,
                message: "Bank offer not found",
            })
        }

        resp.json({
            success: true,
            message: "Bank offers",
            bankOffer: deletedBankOffer,
        })
    } catch (error) {
        resp.json({
            success: false,
            message: error.message,
        })
    }
});

module.exports = router;

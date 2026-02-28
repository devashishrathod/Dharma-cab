require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../model/customer/account");
const accountMiddleware = require("../../middleware/account");

// Get Profile
router.get("/profile", accountMiddleware, async (req, resp) => {
    try {
        console.log("hi i am pass1 ");
        const profileData = await User.findOne({
            _id: req.accountId,
        });
        if (!profileData) {
            resp.send("Unable to find");
        }
        resp.json({
            success: true,
            msg: "Profile Data",
            data: profileData,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

router.put("/profile", accountMiddleware, async (req, resp) => {
    try {

        const profile = await User.findOne({
            _id: req.accountId,
        });

        profile.email = req.body.email;
        profile.name = req.body.name;
        profile.emergencyContactNumber = req.body.emergencyContactNumber;

        profile.trackingNumber = req.body.trackingNumber;
        profile.imgUrl = req.body.imgUrl;
        profile.mobileNumber = req.body.mobileNumber;

        await profile.save();

        resp.json({
            success: true,
            msg: "Profile updated successfully",
            data: profile,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

router.put("/profile/address", accountMiddleware, async (req, resp) => {
    try {
        const profile = await User.findOneAndUpdate({
            _id: req.accountId,
        },
        {
            favoriteAddress : [{
                title : req.body.title,
                address : req.body.address
            }]
        });
        resp.json({
            success: true,
            msg: "Profile Address updated successfully",
            data: profile,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

router.delete("/profile/delete", accountMiddleware, async (req, resp) => {
    try {
        const profile = await User.findByIdAndDelete(req.accountId );
        resp.json({
            success: true,
            msg: "Address removed successfully",
            data: profile,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});


module.exports = router;

require("dotenv").config();
const express = require("express");
const router = express.Router();
const Enquiry = require("../../model/customer/enquiry");
const accountMiddleware = require("../../middleware/account");

// Add enquiry
router.post("/enquiry", async (req, resp) => {
    try {
        const newEnquiry = new Enquiry(req.body);
        const savedEnquiry = await newEnquiry.save();
        resp.json({
            success: true,
            msg: "Enquiry Registered",
            data: savedEnquiry,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Get All  enquiry
router.get("/enquiries", async (req, resp) => {
    try {
        const enquiries = await Enquiry.find();
        resp.json({
            success: true,
            msg: "Enquiries Details",
            data: enquiries,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Get perticular enquiry by email
router.get("/enquiry", async (req, resp) => {
    try {
        const enquiries = await Enquiry.findOne({
            email: req.body.email,
        });
        resp.json({
            success: true,
            msg: "Enquiry Details",
            data: enquiries,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Update enquiry by email
router.put("/enquiry", async (req, resp) => {
    try {
        const enquiry = await Enquiry.findOne({
            email: req.body.email,
        });
        enquiry.name = req.body.name;
        enquiry.email = req.body.email;
        enquiry.contact = req.body.contact;
        enquiry.comment = req.body.comment;
        enquiry.city = req.body.city;
        enquiry.date = req.body.date;
        enquiry.time = req.body.time;
        await enquiry.save();
        resp.json({
            success: true,
            msg: "Enquiry Details",
            data: enquiry,
        });
    } catch (err) {
        resp.json({
            success : false,
            msg : err.message
        })
    }
});
// Delete enquiry by email
router.delete("/enquiry", async (req, resp) => {
    try {
        const enquiry = await Enquiry.findOneAndDelete({
            email: req.body.email,
        });
        if (!enquiry) {
            resp.json({
                success: false,
                msg: "enquiry Not found",
            });
        }
        resp.json({
            success: true,
            msg: "enquiry Deleted",
            data: enquiry,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

module.exports = router;

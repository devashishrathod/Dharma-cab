require("dotenv").config();
const express = require("express");
const router = express.Router();
const Partner = require("../../model/customer/partner");
// Add partner
router.post("/partner", async (req, resp) => {
    try {
        const newPartner = new Partner(req.body);
        const savedPartner = await newPartner.save();
        resp.json({
            success: true,
            msg: "Partner Registered",
            data: savedPartner,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Get All  partner
router.get("/partners", async (req, resp) => {
    try {
        const partners = await Partner.find();
        resp.json({
            success: true,
            msg: "Partners Details",
            data: partners,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Get perticular Partner by email
router.get("/partner", async (req, resp) => {
    try {
        const partners = await Partner.findOne({
            email: req.body.email,
        });
        resp.json({
            success: true,
            msg: "Partner Details",
            data: partners,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Update partner by email
router.put("/partner", async (req, resp) => {
    try {
        const partner = await Partner.findOne({
            email: req.body.email,
        });
        partner.name = req.body.name;
        partner.email = req.body.email;
        partner.contact = req.body.contact;
        partner.state = req.body.state;
        partner.city = req.body.city;
        partner.status = req.body.status;
        await partner.save();
        resp.json({
            success: true,
            msg: "partner Details updated",
            data: partner,
        });
    } catch (err) {
        resp.json({
            success : false,
            msg : err.message
        })
    }
});
// Delete partner by email
router.delete("/partner", async (req, resp) => {
    try {
        const partner = await Partner.findOneAndDelete({
            email: req.body.email,
        });
        if(!partner){
            resp.json({
                success: false,
                msg: "Partner Not found"
            });
        }
        resp.json({
            success: true,
            msg: "Partner Deleted",
            data: partner
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

module.exports = router;

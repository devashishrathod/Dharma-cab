// routes/promoCodeRoutes.js
const express = require('express');
const router = express.Router();
const PromoCode = require('../../model/customer/promoCode');
const accountMiddleware = require("../../middleware/account");
const pricingModel = require("../../model/admin/pricing");

// @route   POST /api/promo/validate
// @desc    Validate promo code for a user
// @body    { userId, promoCode }
// @return  { valid: true/false, discountAmount?, message }
router.post('/create', async (req, res) => {
    try {  
      const promo = new PromoCode({...req.body});

      await promo.save();
      res.status(201).json({ success: true, promo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error creating promo code' });
    }
  });
  
  // ===================
  // GET ALL PROMO CODES
  // ===================
 router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const total = await PromoCode.countDocuments();
    const promos = await PromoCode.find()
      // .populate('validUsers', 'name email')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data:promos
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: 'Error fetching promo codes' });
  }
});

  
  // ===================
  // UPDATE PROMO CODE
  // ===================
  router.put('/update/:id', async (req, res) => {
    try {
      const updated = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Promo code not found" });
      }
      res.status(200).json({ success: true, promo: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating promo code" });
    }
  });
  
  // ===================
  // DELETE PROMO CODE
  // ===================
router.delete('/delete/:id', async (req, res) => {
    try {
      const deleted = await PromoCode.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Promo code not found" });
      }
      res.status(200).json({ success: true, message: "Promo code deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error deleting promo code" });
    }
});


  
router.post('/validate',accountMiddleware, async (req, res) => {
   const {  promoCode } = req.body;
   const { accountId } = req;
   const userId =accountId

  if (!userId || !promoCode) {
    return res.status(400).json({ success: false, message: "User ID and promo code are required" });
  }

  try {
    const code = await PromoCode.findOne({ code: promoCode.trim(), isActive: true });

    if (!code) {
      return res.status(404).json({ success: false, message: "Invalid or expired promo code" });
    }

    if (code.expiryDate < new Date()) {
      return res.status(410).json({ success: false, message: "Promo code has expired" });
    }

    if (!code?.validUsers?.includes(userId) && code?.isOnlyForValidUser) {
      return res.status(403).json({ success: false, message: "Promo code is not valid for this user" });
    }

    return res.status(200).json({
      success: true,
      discountType: code.discountType,
      discountValue: code.discountValue,
      message: "Promo code is valid"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/booking_price_calc', accountMiddleware, async (req, res) => {
  const { rideType, promoCode = "", distance } = req.body;
  const { accountId: userId } = req;

  if (!userId || !rideType || !distance) {
    return res.status(200).json({ success: false, message: "User ID, ride type, and distance are required" });
  }

  try {
    const vehiclePricingInfo = await pricingModel.findOne({ vehicleType: rideType });
    if (!vehiclePricingInfo) {
      return res.status(200).json({ success: false, message: "Pricing info not found for this vehicle type" });
    }

    const baseAmount = distance * vehiclePricingInfo.chargePerKem;
    let discount = 0;
    let discountType = "";
    let promoApplied = false;
    let code = null;

    if (promoCode) {
      code = await PromoCode.findOne({ code: promoCode.trim(), isActive: true });
 


      if (baseAmount >= code?.minOrderAmount && baseAmount <= code?.maxDiscountAmount && code &&code?.isActive) {
        if (code.discountType === "fixed") {
          discount = code.discountValue;
        } else if (code.discountType === "percentage") {
          discount = (baseAmount * code.discountValue) / 100;
        }

        discountType = code.discountType;
        promoApplied = true;
      }
    }

    const payablePrice = Math.max(0, baseAmount - discount);

    return res.status(200).json({
      success:!promoCode?true:promoApplied,
      baseAmount,
      payablePrice,
      discountValue: discount,
      discountType,
      promoApplied,
      message: !promoCode?.trim()?"":promoApplied
        ? "Promo code applied successfully"
        : code
          ? `Ride price must be between ₹${code.minOrderAmount} - ₹${code.maxDiscountAmount}`
          : "No promo code applied"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createOrUpdateReferral,
  getReferrals,
  deleteReferral,
} = require("../../controller/referal");

const accountMiddleware = require("../../middleware/account");

// POST & GET for referrals
router.post("/", accountMiddleware, createOrUpdateReferral);
router.get("/", accountMiddleware, getReferrals);

// DELETE with specific referral ID
router.delete("/delete/:id", accountMiddleware, deleteReferral);

module.exports = router
const mongoose = require("mongoose");

const referalSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "passenger" },
  refereeId: { type: mongoose.Schema.Types.ObjectId, ref: "passenger" },
  referralCode: { type: String },
  rewardAmount: { type: Number, default: 0 },
  creditRewardAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["Pending", "Credited"], default: "Pending" },
  referalType: { type: String, enum: ["Real cash", "Cash Bonus"], default: "Real cash" },
  amountDistributionPercentage: { type: Number, default: 10 },
  isLogin: { type: Boolean, default: false },
}, { timestamps: true });

// ✅ Prevent model overwrite error
module.exports = mongoose.model("referrals", referalSchema);

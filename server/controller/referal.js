const Referral = require("../model/admin/referal");

// @desc    Create or Update referral settings
// @route   POST /api/referral
// @access  Private/Admin
const createOrUpdateReferral = async (req, res) => {
  try {
    const {
      referralType,
      amount,
      amountCollected,
      amountDistributionPercentage,
    } = req.body;

    let referral = await Referral.findOne({});

    if (referral) {
      // Update existing referral
      referral.referralType = referralType ?? referral.referralType;
      referral.amount = amount ?? referral.amount;
      referral.amountCollected = amountCollected ?? referral.amountCollected;
      referral.amountDistributionPercentage =
        amountDistributionPercentage ?? referral.amountDistributionPercentage;

      const updatedReferral = await referral.save();

      return res.json({
        success: true,
        message: "Referral settings updated",
        data: updatedReferral,
      });
    } else {
      // Create new referral
      const newReferral = new Referral({
        referralType,
        amount,
        amountCollected,
        amountDistributionPercentage,
      });

      const createdReferral = await newReferral.save();

      return res.status(201).json({
        success: true,
        message: "Referral settings created",
        data: createdReferral,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create or update referral settings",
      error: error.message,
    });
  }
};

// @desc    Get all referral settings
// @route   GET /api/referral
// @access  Private/Admin
const getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find();
    return res.status(200).json({
      success: true,
      message: "Referral settings fetched successfully",
      data: referrals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch referral settings",
      error: error.message,
    });
  }
};

// @desc    Delete a referral setting
// @route   DELETE /api/referral/:id
// @access  Private/Admin
const deleteReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral setting not found",
      });
    }

    await referral.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Referral setting deleted successfully",
      data: referral,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete referral setting",
      error: error.message,
    });
  }
};

module.exports = {
  createOrUpdateReferral,
  getReferrals,
  deleteReferral,
};

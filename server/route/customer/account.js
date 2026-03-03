require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../../model/customer/account");
const ReferalCount = require("../../model/customer/referalCount");
const ReferalsList = require("../../model/customer/referal");
const ReferalSetting = require("../../model/admin/referal");

//send email with OTP
function sendOtpMail(email, OTP) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "User created successfully",
    text: `
                Welcome to the Dharma Cab!,
                Thank you for choosing us!
                Your OTP is ${OTP}
                `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return { error: error };
    } else {
      console.log("Email sent: " + info.response);
      return resp.json({ success: true, message: info.response });
    }
  });
}

// search user, send email and otp
router.post("/send-otp", async (req, resp) => {
  const { email, fcmToken, referralCode: refCode } = req.body;

  // Generate a 6-digit OTP
  const generatedOTP = Math.floor(100000 + Math.random() * 900000);

  try {
    const existingUser = await User.findOne({ email });
    const referralCount = await ReferalCount.findOne();

    if (existingUser) {
      // Update OTP for existing user
      await User.updateOne(
        { email },
        { $set: { otp: generatedOTP, fcmToken } },
      );
      await sendOtpMail(email, generatedOTP);
      return resp.json({
        success: true,
        msg: "OTP sent successfully to existing user.",
      });
    }

    // Generate unique referral code (e.g., ABCD1, ABCD2...)
    const generateReferralCode = () =>
      Array.from({ length: 4 }, () =>
        String.fromCharCode(Math.floor(Math.random() * 26) + 65),
      ).join("");

    const referralCode =
      generateReferralCode() + (referralCount?.sequence_value || 1);

    // Create new user
    const newUser = await User.create({
      ...req.body,
      otp: generatedOTP,
      referralCode,
    });

    // If referralCode was used, track referral
    if (refCode) {
      const referringUser = await User.findOne({
        referralCode: refCode,
      }).select("name mobileNumber");
      if (referringUser) {
        const referralSetting = await ReferalSetting.findOne();
        await ReferalsList.create({
          referrerId: referringUser._id,
          refereeId: newUser._id,
          referralCode: refCode,
          rewardAmount: referralSetting?.amount || 0,
          creditRewardAmount: 0,
          status: "Pending",
          referalType: "Real cash",
          amountDistributionPercentage:
            referralSetting?.amountDistributionPercentage || 0,
          isLogin: false,
        });
      }
    }

    // If no referral count exists, create it
    if (!referralCount) {
      await ReferalCount.create({ sequence_value: 2 });
    } else {
      // Or increment the sequence
      await ReferalCount.updateOne({}, { $inc: { sequence_value: 1 } });
    }

    await sendOtpMail(email, generatedOTP);

    resp.json({
      success: true,
      msg: "OTP sent and new user created successfully.",
      user: newUser,
    });
  } catch (err) {
    console.error("Error in /send-otp:", err);
    resp
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Generate 6-digit OTP
  const generatedOTP = Math.floor(100000 + Math.random() * 900000);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Update OTP
    await User.updateOne(
      { email },
      {
        $set: { otp: generatedOTP },
      },
    );

    // Send OTP mail
    sendOtpMail(email, generatedOTP);

    return res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: err.message,
    });
  }
});

// verify otp
router.post("/verify-otp", async (req, resp) => {
  try {
    const { email, otp } = req.body;
    console.log("Received OTP:", otp);

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return resp.json({ status: false, msg: "User not found" });
    }

    // console.log( findUser.otp )
    if (otp === findUser.otp) {
      const token = jwt.sign(
        { _id: findUser._id, userStatus: "customer" },
        process.env.JWT_SECRET_KEY,
      );

      // Optionally clear OTP
      // await User.updateOne({ email }, { $unset: { otp: "" } });

      return resp.json({
        status: true,
        msg: "OTP verification successful",
        token,
        referralCode: findUser.referralCode,
        findUser,
      });
    } else {
      return resp.json({
        status: false,
        msg: "Invalid OTP. Please enter again",
      });
    }
  } catch (err) {
    console.error(err);
    return resp
      .status(500)
      .json({ status: false, msg: "Server error", error: err.message });
  }
});

router.post("/validate_referal_code", async (req, resp) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return resp
        .status(200)
        .json({ success: false, message: "Referral code is required" });
    }

    const findUser = await User.findOne({ referralCode }).select(
      "name mobileNumber",
    );

    if (!findUser) {
      return resp
        .status(200)
        .json({ success: false, message: "Invalid referral code" });
    }

    return resp.status(200).json({
      success: true,
      message: "Referral code is valid",
      user: findUser,
    });
  } catch (err) {
    console.error(err);
    return resp
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;

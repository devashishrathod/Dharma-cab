require("dotenv").config();
const bcrypt = require("bcrypt");
const Rider = require("../model/rider/account");

const jwt = require("jsonwebtoken");
const { sendDriverForgotPasswordOTP } = require("../function/sendMail");

const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const min = 100000;
    const max = 999999;
    const generatedOTP = Math.floor(Math.random() * (max - min + 1)) + min;

    const findUser = await Rider.findOne({ email });

    if (!findUser) {
      return res.status(200).json({ statusCode: 401, message: "Invalid OTP or email" });
    }

    await Rider.findByIdAndUpdate(findUser._id, { otp: generatedOTP }, { new: true });

    sendDriverForgotPasswordOTP(email, generatedOTP);

    res.status(200).json({
      statusCode: 200,
      message: "Successfully Confirm",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Something went wrong...",
      success: false,
    });
  }
};

const verifyEmailWithOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const findUser = await Rider.findOne({ email, otp:Number(otp) });

    if (!findUser) {
      return res.status(200).json({
        statusCode: 401,
        message: "Invalid OTP or email.",
        success: false,
      });
    }

const token = jwt.sign(
  { _id: findUser._id, userStatus: "rider" },
  process.env.JWT_SECRET_KEY);

    res.status(200).json({
      statusCode: 200,
      message: "OTP Confirm",
      token,
      email: findUser.email || "",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Something went wrong...",
      success: false,
    });
  }
};


const forgotPasswordUser = async (req, res) => {
  try {
    console.log("hello")
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password is required and must be at least 6 characters long",
      });
    }

    const findUser = await Rider.findById(req.accountId);
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Rider.findByIdAndUpdate(
      req.accountId,
      { password: hashedPassword },
      { new: true }
    );

  return  res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
return res.status(500).json({
  error: error.message,
  message: "Something went wrong while updating password"
});
  }

};



module.exports = {verifyEmailWithOtp,forgotPasswordUser,verifyEmail}
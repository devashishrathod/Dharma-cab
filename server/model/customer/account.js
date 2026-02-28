const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: "XYZ" },
  email: { type: String },
  imgUrl: {
    type: String,
    default:
      "https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg",
  },
  contact: { type: Number },
  state: { type: String },
  city: { type: String },
  emergencyContactNumber : { type: Number},
  trackingNumber : { type: Number },
  favoriteAddress : [
  {
    title : { type: String},
    address : { type: String}
  }
  ],
  otp: { type: Number, default: 0 },
  fcmToken: { type: String },
  mobileNumber :{ type: Number },
  referralCode:{type:String}
});

const userModel = mongoose.model("passenger", userSchema);
module.exports = userModel;

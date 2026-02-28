const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, default: "ADMIN" },
  email: { type: String },
  password : { type: String},
  imgUrl: {
    type: String,
    default:
      "https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg",
  },
});

const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;

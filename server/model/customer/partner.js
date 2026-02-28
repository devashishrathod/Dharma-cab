const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: { type: String, default: "Adiya Partner" },
  email: { type: String },
  contact: { type: Number },
  state: { type: String },
  city: { type: String },
  status : { type: String },
});

const partnerModel = mongoose.model("partner", partnerSchema);
module.exports = partnerModel;

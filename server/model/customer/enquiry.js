const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  name: { type: String, default: "Adiya Partner" },
  email: { type: String },
  contact: { type: Number },
  comment : { type: String },
  city: { type: String },
  date : { type: Date },
  time :{ type: String },
});

const enquiryModel = mongoose.model("enquiry", enquirySchema);
module.exports = enquiryModel;

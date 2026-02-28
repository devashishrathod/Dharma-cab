const mongoose = require("mongoose");

const citydataSchema = new mongoose.Schema({
  city: { type: String },
  areas: [{ type: String }],
  airports: [{ type: String }],
});

const dataModel = mongoose.model("data", citydataSchema);
module.exports = dataModel;

const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  watingMinute: { type: String},
  chargePerKem:{ type: Number, require:true},
  gstPercentage:{ type: Number},
  urgentBookingExtra:{ type: Number},
  isLateNightAv:{ type: Boolean},
  lateNightPercentage:{ type: Number},
  lateNightStartTime:{ type: String},
  lateNightEndTime:{ type: String},
  vehicleType:{ 
    type: String,
    enum:['car','bike','cycle','taxi'],
    require:true
},
},{timestamps:true});

const pricingModel = mongoose.model("pricing", pricingSchema);
module.exports = pricingModel;

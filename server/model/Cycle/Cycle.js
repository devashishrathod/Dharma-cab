const mongoose = require("mongoose");

const cycleSchema = new mongoose.Schema({
  brand: { type: String },
  model: { type: String },
  type: { type: String }, // E.g., Mountain, Road, Hybrid
  imgUrl: { type: String },
  availability: { type: String, default: "Available",enum:[ "Available","Booked"] }, // Available/Booked
  maxpower:{
    type: String 
  },
  maxSpeed:{
    type: String 
  },
  zeroToSixtySpeedTime:{
    type: String 
  },
  imagesList: {
    type: [String],
    default: []
  },
  type: { 
    type: String, 
    default: 'Cycle', 
    immutable: true 
  },
  seatingCapacity: {
    type: Number,
  },
  luggageCapacity: {
    type: Number,
  },
  transmissionType: {
    type: String,
  },
  dailyRate: {
    type: Number,
  },
  monthlyRate: {
    type: Number,
  },
  vehicleNo: { type: String },
  fuelType : { type: String ,default:"NA"},
  location: {
    type: {
      type: String, // Don't remove
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
  },
     createdBy: { type: mongoose.Schema.Types.ObjectId, ref:'rider' },
     puc:{
      type: String 
    },
    vehicleRegistrationNo: { type: String },
    vehicleInsurance: { type: String },
     vehiclePermit: { type: String },
      status:{
    type:String,
    enum:['Active','InActive'],
    default:"InActive"
  }
});

cycleSchema.index({ location: '2dsphere' });
module.exports = mongoose.model("Cycle", cycleSchema);
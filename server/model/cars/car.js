const mongoose = require("mongoose");
const carSchema = new mongoose.Schema({
  manufacturer: {
    type: String,
  },
  model: {
    type: String,
  },
  fuelType: {
    type: String,
  },
  transmissionType: {
    type: String,
  },
  description: {
    type: String,
  },
  type: { 
    type: String, 
    default: 'Car', 
    immutable: true 
  },
  imgUrl: { type: String },
  seatingCapacity: {
    type: Number,
  },
  luggageCapacity: {
    type: Number,
  },
  dailyRate: {
    type: Number,
  },
  monthlyRate: {
    type: Number,
  },
  maxpower:{
    type: String 
  },
  fuelCostAverage:{
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
  availability: {
    type: String, //available/ booked
    default: "Available",
    availability: { type: String, default: "Available",enum:[ "Available","Booked"] }, // Available/Booked
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
    }
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

carSchema.index({ location: '2dsphere' });


const carModel = mongoose.model("car", carSchema);
module.exports = carModel;

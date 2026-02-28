const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId:{type:mongoose.Types.ObjectId,ref:"rider"},
  socketId: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  updatedAt: { type: Date, default: Date.now }
});

driverSchema.index({ location: '2dsphere' });


const Driver = mongoose.model('driverLocation', driverSchema);

module.exports= Driver
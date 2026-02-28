const mongoose =  require('mongoose')

const chatMessageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider',required: true  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client',required: true  },
  senderType: { type: String, enum: ['RIDER', 'CLIENT'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('chatMessageSchema',chatMessageSchema)
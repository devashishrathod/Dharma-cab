const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Rider = require('../models/Rider');
const Client = require('../models/Client');

router.get('/chat/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const messages = await ChatMessage.find({ bookingId }).sort({ timestamp: 1 });

    // Populate sender details manually
    const populatedMessages = await Promise.all(messages.map(async (msg) => {
      let senderData = null;

      if (msg.senderType === 'Rider') {
        senderData = await Rider.findById(msg.senderId).select('name avatar'); // select only necessary fields
      } else if (msg.senderType === 'Client') {
        senderData = await Client.findById(msg.senderId).select('name avatar');
      }
      
      return {
        _id: msg._id,
        message: msg.message,
        timestamp: msg.timestamp,
        senderType: msg.senderType,
        sender: senderData
      };
    }));

    res.status(200).json(populatedMessages);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

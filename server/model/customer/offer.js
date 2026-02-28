const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    validity: {
        type: String, // e.g., "Black Friday", "Christmas", "Limited Time"
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now // When the offer becomes active
    },
    endDate: {
        type: Date,
        required: true // When the offer expires
    },
    isActive: {
        type: Boolean,
        default: true
    },
    imageUrl: { // If offers have specific images
        type: String
    },
    promoCode: { // If there's a specific code
        type: String
    },
    
    // Add more fields as needed (e.g., targetAudience, minimumPurchase)
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Offer', offerSchema);
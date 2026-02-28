const mongoose = require("mongoose");
const dailyOfferSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    text: {
        type: String,
    },
});
const dailyOfferModel = mongoose.model("dailyOffers", dailyOfferSchema);
module.exports = dailyOfferModel;

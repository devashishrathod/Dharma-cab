const mongoose = require("mongoose");
const monthlyOfferSchema = new mongoose.Schema({
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
const monthlyOfferModel = mongoose.model("monthlyOffers", monthlyOfferSchema);
module.exports = monthlyOfferModel;

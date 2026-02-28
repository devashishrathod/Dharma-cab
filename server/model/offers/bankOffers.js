const mongoose = require("mongoose");
const bankOfferSchema = new mongoose.Schema({
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
const bankOfferModel = mongoose.model("bankOffers", bankOfferSchema);
module.exports = bankOfferModel;

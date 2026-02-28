const mongoose = require("mongoose");
const citySchema = new mongoose.Schema({
    cityName: { type: String },
    cityBrief: [],
    thumbnailUrl: {
        type: String,
        default:
            "https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg",
    },
    imgUrl: {
        type: String,
        default:
            "https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg",
    },
});

const cityModel = mongoose.model("city", citySchema);
module.exports = cityModel;


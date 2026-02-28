const DriverRatingReview = require("../model/customer/driverRating");
const booking = require("../model/booking/booking");

const addDriverRating = async (req, res) => {
  try {
    const accountId  =  req.accountId
    const { bookingId, rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 to 5." });
    }
     const bookingRes = await booking.findById(bookingId).populate([
              { path: "car", select: "createdBy" },
              { path: "bike", select: "createdBy" },
              { path: "taxi", select: "createdBy" },
              { path: "cycle", select: "createdBy" },
            ]);

    let  driverId = ( bookingRes?.car?.createdBy || bookingRes?.bike?.createdBy ||
    bookingRes?.taxi?.createdBy || bookingRes?.cycle?.createdBy)?.toString();

    const alreadyReviewed = await DriverRatingReview.findOne({ bookingId })
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this ride." });
    }


    const newReview = new DriverRatingReview({
      bookingId,
      driverId,
      userId:accountId,
      rating,
      review
    });
    await newReview.save();

    res.status(201).json({ message: "Rating and review submitted successfully." });
  } catch (error) {
    console.error("Review error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const getDriverReviews = async (req, res) => {
  try {
    const { driverId } = req.params;

    const reviews = await DriverRatingReview.find({ driverId }).populate("userId", "name profileImgUrl");

    const averageRating = await DriverRatingReview.aggregate([
      { $match: { driverId: new mongoose.Types.ObjectId(driverId) } },
      {
        $group: {
          _id: "$driverId",
          average: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      averageRating: averageRating[0]?.average || 0,
      totalReviews: averageRating[0]?.totalReviews || 0,
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get reviews." });
  }
};

module.exports = {addDriverRating,getDriverReviews}
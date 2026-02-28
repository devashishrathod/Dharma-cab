const router = require("express").Router();
const Cars = require("../../model/cars/car");

// get car list
router.get("/cars", async (req, resp) => {
  const { fuelType, transmissionType, seatingCapacity, luggageCapacity } =
    req.query;
  console.log(req.query)
  //create one object to store query
  let queryObject = {};
  try {
    //check if any query is passed
    if (fuelType) {
      queryObject.fuelType = fuelType;
    }
    if (transmissionType) {
      queryObject.transmissionType = transmissionType;
    }
    if (seatingCapacity) {
      queryObject.seatingCapacity = Number(seatingCapacity);
    }
    if (luggageCapacity) {
      queryObject.luggageCapacity = Number(luggageCapacity);
    }
    //find cars according to query
    const list = await Cars.find(queryObject);
    resp.send({ success: true, data: list });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;

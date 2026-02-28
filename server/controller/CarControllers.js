const { default: mongoose } = require("mongoose");
const Car = require("../model/cars/car");

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a car by ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    const {lat,lng} = req.query 
    if (!car || !car.location || !car.location.coordinates) {
      return res.status(404).json({ success: false, message: "Car not found or location missing" });
    }

    // const [lng, lat] = car.location.coordinates;
    console.log(lng, lat)
    // Aggregation to get nearby cars with distance
    const nearbyCars = await Car.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          distanceField: "distance",
          // maxDistance: 10000,
          spherical: true,
          // query: { _id: { $ne: car._id } }
        }
      },
            {
        $match:{
          _id:new mongoose.Types.ObjectId(req.params.id)
        }
      },
    ]);


    const carObj  =   car.toObject()
    car.carObj = nearbyCars[0].distance / 10000;

    res.status(200).json({
      success: true,
      data: {
        car: {...car.toObject(),
        calculatedDistance:"2km"
      }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Add a car
exports.addCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a car
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.status(200).json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.status(200).json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

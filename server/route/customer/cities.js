const express = require("express");
const router = express.Router();
const City = require("../../model/customer/cities");
router.post("/cities", async (req, resp) => {
    try {
        const city = new City({
            ...req.body,
        });
        await city.save();
        resp.json({
            success: true,
            msg: "City Data",
            data: city,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});
// todo I have two params  of cityName one is from and another one to i have to send detilais in array
router.get("/cities/:source/:destination", async (req, resp) => {
    try {
        const { source, destination } = req.params;
        const cities = await City.find({
            cityName: { $in: [source, destination] },
        });

        const sourceCity = cities.find(city => city.cityName === source);
        const destinationCity = cities.find(city => city.cityName === destination);
        resp.json({
            success: true,
            msg: "City Data",
            data: [
                sourceCity, 
                destinationCity
            ],
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

module.exports = router;

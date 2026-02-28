const express = require('express');
const router = express.Router();

const Car = require('../../model/cars/car');
const Taxi = require('../../model/Taxi/Taxi');
const Bike = require('../../model/Bike/Bike');
const Cycle = require('../../model/Cycle/Cycle');

const accountMiddleware = require('../../middleware/account');


router.get('/all_Rider_Vehicle', accountMiddleware, async (req, res) => {
    const { type, page = 1, limit = 10 } = req.query; // default page = 1, limit = 10

    try {
        if (!type) {
            return res.status(400).json({ success: false, message: 'Vehicle type is required' });
        }

        const vehicleModels = {
            car: Car,
            taxi: Taxi,
            bike: Bike,
            cycle: Cycle
        };

        const model = vehicleModels[type.toLowerCase()];
        if (!model) {
            return res.status(400).json({ success: false, message: 'Invalid vehicle type' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [vehicles, totalCount] = await Promise.all([
            model.find().skip(skip).limit(parseInt(limit)),
            model.countDocuments()
        ]);

        if (vehicles.length === 0) {
            return res.status(404).json({ success: false, message: `No ${type}s found for this account` });
        }

        res.status(200).json({
            success: true,
            message: `${type}s retrieved successfully`,
            data: vehicles,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
    }
});

router.get('/rider_Vehicle_info/:vehicleId/:type', accountMiddleware, async (req, res) => {
    const { vehicleId,type } = req.params;
    const { accountId } = req;

    try {
        if (!type) {
            return res.status(400).json({ message: 'Vehicle type is required' });
        }

        let VehicleModel;

        switch (type.toLowerCase()) {
            case 'car':
                VehicleModel = Car;
                break;
            case 'taxi':
                VehicleModel = Taxi;
                break;
            case 'bike':
                VehicleModel = Bike;
                break;
            case 'cycle':
                VehicleModel = Cycle;
                break;
            default:
                return res.status(400).json({ message: 'Invalid vehicle type' });
        }

        const updatedVehicle = await VehicleModel.findById(vehicleId);

        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found or not authorized to update' });
        }

        res.status(200).json({ message: `${type} updated successfully`, data: updatedVehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});


module.exports = router
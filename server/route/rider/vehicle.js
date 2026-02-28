const express = require('express');
const router = express.Router();

const Car = require('../../model/cars/car');
const Taxi = require('../../model/Taxi/Taxi');
const Bike = require('../../model/Bike/Bike');
const Cycle = require('../../model/Cycle/Cycle');
const accountMiddleware = require('../../middleware/account');

// POST /api/vehicle
router.post('/',accountMiddleware, async (req, res) => {
    const { type, vehicleData } = req.body;

    try {
        let newVehicle;

        switch (type?.toLowerCase()) {
            case 'car':
                newVehicle = new Car({...vehicleData,   createdBy:req.accountId});
                break;
            case 'taxi':
                newVehicle = new Taxi({...vehicleData,   createdBy:req.accountId});
                break;
            case 'bike':
                newVehicle = new Bike({...vehicleData,   createdBy:req.accountId});
                break;
            case 'cycle':
                newVehicle = new Cycle({...vehicleData,   createdBy:req.accountId});
                break;
            default:
                return res.status(400).json({ message: 'Invalid vehicle type' });
        }

        await newVehicle.save();
        res.status(201).json({ message: `${type} created successfully`, data: newVehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

router.get('/', accountMiddleware, async (req, res) => {
    const { type } = req.query; // type is passed as a query parameter
    const { accountId } = req; // accountId from the middleware

    try {
        // Validate the type query parameter
        if (!type) {
            return res.status(400).json({success:false, message: 'Vehicle type is required' });
        }

        let vehicles;

        switch (type) {
            case 'car':
                vehicles = await Car.find({ createdBy: accountId });
                break;
            case 'taxi':
                vehicles = await Taxi.find({ createdBy: accountId });
                break;
            case 'bike':
                vehicles = await Bike.find({ createdBy: accountId });
                break;
            case 'cycle':
                vehicles = await Cycle.find({ createdBy: accountId });
                break;
            default:
                return res.status(400).json({success:false,  message: 'Invalid vehicle type' });
        }

        if (vehicles.length === 0) {
            return res.status(404).json({success:false, message: `No ${type}s found for this account` });
        }

        res.status(200).json({ message: `${type}s retrieved successfully`, data: vehicles,success:true});
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false, message: 'Something went wrong', error: error.message });
    }
});

router.put('/:vehicleId', accountMiddleware, async (req, res) => {
    const { vehicleId } = req.params;
    const { type, vehicleData } = req.body;
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

        const updatedVehicle = await VehicleModel.findOneAndUpdate(
            { _id: vehicleId, createdBy: accountId },
            { $set: vehicleData },
            { new: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found or not authorized to update' });
        }

        res.status(200).json({ message: `${type} updated successfully`, data: updatedVehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

router.put('/select_Active_Vehicle/:vehicleId', accountMiddleware, async (req, res) => {
    const { vehicleId } = req.params;
    const { type, status } = req.body;
    const { accountId } = req;

    try {
        if (!type || !status) {
            return res.status(400).json({ message: 'Vehicle type and status are required' });
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
if (status === 'Active') {
    // Set all other vehicles of all types to inactive
    await Promise.all([
        Car.updateMany(
            { createdBy: accountId },
            { $set: { status: 'Inactive' } }
        ),
        Taxi.updateMany(
            { createdBy: accountId },
            { $set: { status: 'Inactive' } }
        ),
        Bike.updateMany(
            { createdBy: accountId },
            { $set: { status: 'Inactive' } }
        ),
        Cycle.updateMany(
            { createdBy: accountId },
            { $set: { status: 'Inactive' } }
        )
    ]);
}

        // Update selected vehicle to given status (active or inactive)
        const updatedVehicle = await VehicleModel.findOneAndUpdate(
            { _id: vehicleId, createdBy: accountId },
            { $set: { status: status } },
            { new: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found or not authorized to update' });
        }

        res.status(200).json({message: `${type} updated successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});



router.delete('/:vehicleId', accountMiddleware, async (req, res) => {
    const { vehicleId } = req.params;
    const { type } = req.body; // You may also pass this as a query param if preferred
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

        const deletedVehicle = await VehicleModel.findOneAndDelete({
            _id: vehicleId,
            createdBy: accountId
        });

        if (!deletedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found or not authorized to delete' });
        }

        res.status(200).json({ message: `${type} deleted successfully`, data: deletedVehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});



module.exports = router;







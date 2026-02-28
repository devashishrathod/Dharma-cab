const router = require('express').Router()
const RentalBooking = require('../../model/bookings/rental')

router.get("/get-rental-bookings", async (req, resp) => {
    try {
        const allBookings = await RentalBooking.find({}).populate('passengerId').populate('carId')
        resp.send({ success: true, allBookings })
    } catch (err) {
        return resp.send({ success: false, msg: err.message })
    }
})

module.exports = router
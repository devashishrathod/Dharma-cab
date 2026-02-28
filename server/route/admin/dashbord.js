const express =  require('express')
const accountMiddleware = require('../../middleware/account')
const cycale  = require('../../model/Cycle/Cycle')
const bike  = require('../../model/Bike/Bike')
const taxi  = require('../../model/Taxi/Taxi')
const car  = require('../../model/cars/car')
const booking = require('../../model/booking/booking')

const router =  express.Router()


router.get('/dashbord/detail',accountMiddleware,async (req,res)=>{
try{
const cycaleCount =await cycale.countDocuments()    
const bikeCount =await bike.countDocuments()    
const taxiCount =await taxi.countDocuments()    
const carCount =await car.countDocuments() 

const response = await booking.aggregate([
  {
    $facet: {
      groupedByStatus: [
        {
          $group: {
            _id: "$bookingStatus",
            count: { $sum: 1 },
            ongoingRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$bookingStatus", "completed"] },
                  "$payableAmount", // Change this to your fare/amount field
                  0,
                ],
              },
            },
          },
        },
      ],
      totalBookings: [{ $count: "total" }],
    },
  },
]);

const bookingList = await booking.find().limit(5)

const bookingCountObj = {
    ['cancelled']:0,
    ['ongoing']:0,
    ['completed']:0,
    ['waitingforpickup']:0,
    ['ongoingRevenue']:0
}

const bookingCount =  response[0]?.groupedByStatus?.reduce((crr,el)=>{
crr[el._id?.split(' ').join('')] = el.count
crr['ongoingRevenue'] = el.ongoingRevenue
return crr
},bookingCountObj)

bookingCount.totalBookings = response[0]?.totalBookings[0]?.total||0

res.status(200).json({
    data:{
        cycaleCount,
        bikeCount,
        taxiCount,
        carCount,
        bookingCount:bookingCount||bookingCountObj
    },
    success:true,
})
}catch (error){
    console.log(error)
res.status(500).json({
    data:error,
    success:false
})
}
})

module.exports = router
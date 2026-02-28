require("dotenv").config();

const Car = require("../model/cars/car");
const Bike = require("../model/Bike/Bike");
const Taxi = require("../model/Taxi/Taxi");
const Cycle = require("../model/Cycle/Cycle");

const handaleVehicleByStatus =async (type="car",onlineDrivers)=>{

try{
   let vehicelModel = Car

    switch(type){
      case 'car':
       vehicelModel = Car      
      break
      case 'bike':
       vehicelModel =  Bike
      break
      case 'taxi':
       vehicelModel = Taxi
      break
      case 'cycle':
       vehicelModel = Cycle
      break    
      default:
       vehicelModel = Car
    }

    const response = await vehicelModel.aggregate([
         {
            $project:{
                availability:"$availability",
                status:"$status",
                type:"$type",
                vehicleNo:"$vehicleNo",
                location:"$location",
                createdBy:"$createdBy",
                status:"$status"
            }
         },
         {
            $lookup:{
               from:"riders",
               localField:"createdBy",
               pipeline:[{
                  $project:{
                    lat: "$lat",
                    long: "$long",
                    riderId: "$riderId",
                    gender: "$male",
                    profileImgUrl:"$profileImgUrl",
                    name:"$name",
                    email: "$email",
                    contact: "$contact",
                  }
               }],
               foreignField:"_id",
               as:"driverInfo"
            }
         },
     {
  $unwind: {
    path: "$driverInfo",
    preserveNullAndEmptyArrays: true
  }
}
    ]) 

    return response

}catch(error){
  throw error
}
}

module.exports = handaleVehicleByStatus
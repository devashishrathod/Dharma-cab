const Rider = require("../../model/rider/account");
const admin = require("firebase-admin");
const serviceAccount = require("../../firebaseServiceKeys.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://<your-project-id>.firebaseio.com",
});

exports.sendSingleNotification = async (
  driverId,
  passengerId,
  title,
  description,
  type = "booking",
  RideData = {},
) => {
  const rider = await Rider.findById(driverId);
  const message = {
    token: rider.fcmToken,
    notification: {
      title: title,
      body: description,
    },
    data: {
      ...RideData,
      bookingStatus: "waiting for pickup",
      passengerId: passengerId?.toString(),
      type: type,
    },
  };
  const data = await admin.messaging().send(message);
  console.log(data, `notificaton sent to ${rider?.name}`);
  // await Notification.create({
  //   passengerId,
  //   title: name,
  //   message: description,
  //   driverId
  //   type,
  // });
};

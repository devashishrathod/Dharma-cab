const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const Rider = require("../../model/rider/account");

let serviceAccount;

// Render Secret File Path
const renderSecretPath = "/etc/secrets/firebaseServiceKeys.json";

if (fs.existsSync(renderSecretPath)) {
  console.log("✅ Using Firebase Secret File from Render");
  serviceAccount = require(renderSecretPath);
} else {
  console.log("✅ Using Local Firebase Service Account");
  serviceAccount = require(
    path.join(__dirname, "../../firebaseServiceKeys.json"),
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// module.exports = admin;

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // databaseURL: "https://<your-project-id>.firebaseio.com",
// });

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

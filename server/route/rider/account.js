require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Rider = require("../../model/rider/account");
const jwt = require("jsonwebtoken");
const accountMiddleware = require("../../middleware/account");
const nodemailer = require("nodemailer");
const { verifyEmail, verifyEmailWithOtp, forgotPasswordUser } = require("../../controller/driverController");

//send  SingUp mail
function sendSingUpMail(email) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });

    let mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Account created successfully",
        text: `     Hello,
      Your account has been created and under admin verification. We will get back to you within 72 hours.

              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return { error: error };
        } else {
            console.log("Email sent: " + info.response);
            return resp.json({ success: true, message: info.response });
        }
    });
}

// Rider Singup
router.post("/rider-signup", async (req, resp) => {
    try {
        const { email, contact, password } = req.body;

        const findRiderEmail = await Rider.findOne({ email });
        const findRiderContact = await Rider.findOne({ contact });

        if (findRiderEmail || findRiderContact) {
            return resp.json({
                success: false,
                msg: "Account already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const maxRider = await Rider.findOne({}, {}, { sort: { serialNo: -1 } });
        const nextRiderId = maxRider ? maxRider.serialNo + 1 : 1;
        const year = new Date().getFullYear().toString().slice(-2);

        const riderId = `MERU${year}${nextRiderId + 1000}`;

        const newRider = new Rider({
            ...req.body,
            password: hashedPassword,
            serialNo: nextRiderId,
            riderId,
            currentLocation: `${req.body.city}, ${req.body.state}`
        });

        await sendSingUpMail(newRider.email, newRider.name);

        const findRider = await newRider.save();

        const token = jwt.sign({ _id: findRider._id,userStatus:"rider" }, process.env.JWT_SECRET_KEY);

        resp.json({
            success: true,
            riderId: riderId,
            msg: "Account Created. Will get back tou you within 72 hours",
            data: newRider,
            token: token,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Rider Login
router.post("/rider-login", async (req, resp) => {
    const { email, password, fcmToken } = req.body;

    try {
        // const findRider = await Rider.findOne({
        //     $or: [{ email: userId }, { contact: userId },{riderId : userId}],
        // });
        const findRider = await Rider.findOne({ email:email }).select("+password");
        await Rider.findOneAndUpdate({ email:email },{fcmToken:fcmToken},{new:true});

        console.log( findRider)


        if (!findRider) {
            return resp.json({
                success: false,
                msg: "Account not found, Check Credentials",
            });
        }
        if (findRider.adminVerification == false) {
            return resp.json({
                success: false,
                status: "adminVerification",
                msg: "Sorry for delay, Your account is under verification. We will get back to you",
            });
        }
        const validPassword = await bcrypt.compare(password, findRider.password);
        if (!validPassword) {
            return resp.json({
                success: false,
                msg: "Incorrect Credentials",
            });
        }
        const token = jwt.sign({ _id: findRider._id, userStatus:"rider" }, process.env.JWT_SECRET_KEY);
        
        await findRider.save();

        resp.json({
            success: true,
            msg: "Login successful",
            currentLocation: findRider.currentLocation,
            token: token,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

//Get profile information
router.get("/rider-profile", accountMiddleware, async (req, resp) => {
    try {
        const rider = await Rider.findOne({ _id: req.accountId });
        if (!rider) {
            return resp.json({
                success: false,
                msg: "Rider not found",
            });
        }
        resp.json({
            success: true,
            msg: "Rider Details ",
            data: rider,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// router.put("/rider-update-profile", accountMiddleware, async (req, resp) => {
//     try {
//         const {
//             name,
//             contact,
//             locality,
//             city,
//             state,
//             pincode,
//             profileImgUrl,
//             drivingLicenseNo,
//             vehicleRegistrationNo,
//         } = req.body;
//         const riderId = req.accountId;
//         const rider = await Rider.findById(riderId);
//         if (!rider) {
//             return resp.json({
//                 success: false,
//                 msg: "Rider not found",
//             });
//         }
//         rider.name = name;
//         rider.contact = contact;
//         rider.locality = locality;
//         rider.city = city;
//         rider.state = state;
//         rider.pincode = pincode;
//         rider.profileImgUrl = profileImgUrl;
//         rider.vehicleRegistrationNo = vehicleRegistrationNo;
//         rider.drivingLicenseNo = drivingLicenseNo;
//         const updatedRider = await rider.save();
//         resp.json({
//             success: true,
//             msg: "Rider Details updated successfully",
//             data: rider,
//         });
//     } catch (err) {
//         resp.json({
//             success: false,
//             msg: err.message,
//         });
//     }
// });
router.put("/rider-update-profile", accountMiddleware, async (req, resp) => {
    try {
        // const {
        //     name,
        //     contact,
        //     locality,
        //     city,
        //     state,
        //     pincode,
        //     profileImgUrl,
        //     drivingLicenseNo,
        //     vehicleRegistrationNo,
        // } = req.body;

        const riderId = req.accountId;

        const updatedRider = await Rider.findByIdAndUpdate(
            riderId, req.body,{ new: true }
        );

        if (!updatedRider) {
            return resp.json({
                success: false,
                msg: "Rider not found",
            });
        }

        resp.json({
            success: true,
            msg: "Rider Details updated successfully",
            data: updatedRider,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Update rider current Location
router.put("/current-location-update", accountMiddleware, async (req, resp) => {
    try {
        const city = req.body.city;
        const riderId = req.accountId;
        const rider = await Rider.findByIdAndUpdate(riderId, {
            currentLocation: city,
        });
        await rider.save();
        resp.json({
            success: true,
            msg: "Rider location updated successfully",
            currentLocation: city,
        });
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});

// Rider car details update
router.put("rider-car-update", accountMiddleware, async (req, resp) => {
    try {
        const rider = await Rider.findOneAndUpdate(
            { _id: req.accountId },
            {
                companyName: req.body.companyName,
                model: req.body.model,
                color: req.body.color,
            }
        );
    } catch (err) {
        resp.json({
            success: false,
            msg: err.message,
        });
    }
});


router.post('/rider-verify-email_forgetPassword',verifyEmail)
router.post('/rider-verify-email_otp_forgetPassword',verifyEmailWithOtp)
router.post('/rider-verify-new_forgetPassword', accountMiddleware, forgotPasswordUser);

module.exports = router;

const nodemailer = require("nodemailer");

function sendDriverForgotPasswordOTP(email, otp) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333;">🔐 Password Reset Request</h2>
            <p>Hello Driver,</p>
            <p>You have requested to reset your password. Please use the OTP below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #007bff;">${otp}</span>
            </div>
            <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <br />
            <p style="color: #555;">Thank you,<br>The Driver Support Team</p>
        </div>
    `;

    let mailOptions = {
        from: `"Driver App Support" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: "Driver App - Password Reset OTP",
        html: htmlContent,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("OTP email sent: " + info.response);
        }
    });
}


module.exports = {sendDriverForgotPasswordOTP}
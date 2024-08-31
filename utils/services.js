const bcrpt = require('bcrypt')
const otpSchema = require('../models/otpmodel')
const userSchema = require('../models/usermodel')
const notificationSchema = require('../models/notificationmodel')
// const plivo = require('plivo');
const Axios = require('axios')
const nodemailer = require('nodemailer')


// Initialize the fast2Sms client
const authToken = process.env.OTP_TOKEN;

const sendOTP = async (phoneNumber, otp) => {
    const smsData = {
        "route": "otp",
        "variables_values": otp,
        "numbers": phoneNumber,
    }
    await Axios.post('https://www.fast2sms.com/dev/bulkV2', smsData, {
        headers: {
            "authorization": authToken
        }
    })
        .then((resp) => {
            console.log("sms sent successfully", resp.data);
            console.log(resp.data)
        })
        .catch((error) => {
            console.log("error in sending sms", error)
        })
}

// const emailOtp = async (email, otp) => {

//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             host: 'smtp.gmail.email',
//             port: 587,
//             secure: false,
//             auth: {
//                 user: 's7partys@gmail.com',
//                 pass: 'nghc gvez ikty lziy'
//             }
//         });

//         const mailOptions = {
//             from: 's7partys@gmail.com',
//             to: email,
//             subject: "OTP Verification",
//             html: `
//     <p>Dear User,</p>
//     <p>Thank you for registering with us. To complete your registration, please verify your email address by using the One-Time Password (OTP) provided below.</p>
//     <p><strong>Your OTP is: ${otp}</strong></p>
//     <p>Please enter this OTP on the verification page to confirm your email address. This OTP is valid for 2 minutes.</p>
//     <p><strong>For your security, please do not share this OTP with anyone.</strong> If you did not request this verification, please ignore this email or contact our support team immediately.</p>
//     <p>Best regards,</p>
//     <p>Mindstay Technology (OPC) Pvt Limited</p>
//     <p>
//       Customer Support: <a href="mailto:s7partys@gmail.com">s7partys@gmail.com</a><br>
//       Phone: +91 8660688752 <br>
//       Website: <a href="https://sissoo.in/">https://sissoo.in/</a>
//     </p>
//   `,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log("OTP email sent successfully!");

//     } catch (error) {
//         console.error("Error sending OTP email:", error);
//     }
// }

const emailOtp = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com', // Hostinger's SMTP server
            port: 465, // Port for TLS
            secure: true, // true for port 465, false for other ports
            auth: {
                user: 'no-reply@sissoo.in', // Your email address
                pass: 'Mindstay@123', // Your email password
            },
            tls: {
                rejectUnauthorized: false, // Accept self-signed certificates
            },
            debug: true, // Enable debug output
            logger: true // Log information in console
        });

        const mailOptions = {
            from: 'no-reply@sissoo.in',
            to: email,
            subject: "OTP Verification",
            html: `
                <p>Dear User,</p>
                <p>Thank you for registering with us. To complete your registration, please verify your email address by using the One-Time Password (OTP) provided below.</p>
                <p><strong>Your OTP is: ${otp}</strong></p>
                <p>Please enter this OTP on the verification page to confirm your email address. This OTP is valid for 2 minutes.</p>
                <p><strong>For your security, please do not share this OTP with anyone.</strong> If you did not request this verification, please ignore this email or contact our support team immediately.</p>
                <p>Best regards,</p>
                <p>Mindstay Technology (OPC) Pvt Limited</p>
                <p>
                    Customer Support: <a href="mailto:info@sissoo.in">info@sissoo.in</a><br>
                    Phone: +91 8660688752 <br>
                    Website: <a href="https://sissoo.in/">https://sissoo.in/</a>
                </p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully!");

    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

const generateOtp = () => {
    //generate otp code 4 digit
    const otp = Math.floor(1000 + Math.random() * 9000)
    return otp
}

const compareOtp = async (otp, number) => {
    console.log(otp, number)
    const finduser = await otpSchema.findOne(
        {
            contactInfo: number
        }
    )
    if (!finduser) {
        console.log('user Not found')
    }
    else {
        const validotp = bcrpt.compare(otp, finduser?.Otp)
        return validotp
    }
}

const decodedpassword = async (email, password) => {
    const find = await userSchema.findOne({ email })
    if (find) {
        let decrypted = await bcrpt.compare(password, find.password)
        return decrypted
    }
    else {
        return false
    }

}

const notifications = async (userId, notifications) => {
    console.log('nofitificaiton', notifications)
    try {
        const findUser = await notificationSchema.findOne({ userId })
        if (findUser) {
            const update = await notificationSchema.findOneAndUpdate(
                { userId },
                { $push: { notifications } },

            )
            return update
        }
        else {
            const create = new notificationSchema(
                {
                    userId,
                    notifications
                }
            )
            create.save()
            return create
        }
    }
    catch (error) {
        console.log(error)
        return error
    }

}


module.exports = { generateOtp, emailOtp, compareOtp, sendOTP, decodedpassword, notifications }

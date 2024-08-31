// const userSchema = require('../models/usermodel')
const trainerSchema = require('../models/trainermodel')
const employerSchema = require('../models/employermodel')
const otpSchema = require('../models/otpmodel')
const { generateToken } = require('../config/jwttoken.js')
const { generateOtp, compareOtp, sendOTP, decodedpassword, emailOtp } = require('../utils/services.js')
const localStorage = require('localStorage')
const Cookies = require('js-cookie')
const sessionSchema = require('../models/sessionsModel.js');
const studentSchema = require('../models/studentmodel')


// Generate opt api 

const generateopt = async (req, resp) => {
    const { contactDetails } = req.body
    console.log(req.body);
    if (/^[0-9]{10}$/.test(contactDetails)) {
 
        try {
 
            let user = await otpSchema.findOne({ contactInfo: contactDetails })
            if (!user) {
                user = new otpSchema({
                    contactInfo: contactDetails
                })
            }
 
            const otp = generateOtp()
            user.Otp = otp
            await user.save();
 
            await sendOTP(contactDetails,otp)
            console.log(otp)
            await localStorage.setItem('phoneNumber', JSON.stringify(contactDetails))
            resp.status(200).json({ success: true, message: 'Otp sended', otp })
 
        }
        catch (err) {
            console.log(err)
            resp.status(200).json({ success: false, error: 'Internal Server Error', err })
        }
    }
    
    else if (/^\S+@\S+\.\S+$/.test(contactDetails)) {
 
        console.log(contactDetails);
 
        try {
            let user = await otpSchema.findOne({ contactInfo: contactDetails })
            if (!user) {
                user = new otpSchema({
                    contactInfo: contactDetails
                })
            }
            const otp = generateOtp()
            user.Otp = otp
            await user.save();
            await emailOtp(contactDetails, otp)
            console.log(otp)
            // await localStorage.setItem('phoneNumber', JSON.stringify(contactDetails))
            resp.status(200).json({ success: true, message: 'Otp sended', otp })
        }
        catch (err) {
            console.log(err)
        }
 
    }
    else{
        resp.status(200).json({ success: false, error: 'Invalid contact details' })
    }
 
}

//Verify opt api 

// const verifyOtp = async (req, resp) => {

//     const { otp, phoneNumber, } = req.body

//     //finding the users in the db using the phoneNumber and validating the opt

//     const findUser = await otpSchema.findOne({ phoneNumber: phoneNumber })
//     const existTrainer = await trainerSchema.findOne({ primaryNumber: phoneNumber })
//     const existEmployer = await employerSchema.findOne({ primaryNumber: phoneNumber })

//     if (existTrainer && findUser) {
//         const valid = await compareOtp(otp, phoneNumber) //validateting the opt form the user 
//         if (valid) {
//             if (existTrainer?.role === 'trainer') {
//                 const token = await generateToken(existTrainer._id) //generating the token to the exiting user according to the role 
//                 resp.status(200).json({ success: true, message: 'verifiedExitingTrainer', existTrainer, token })
//             }
//         }
//         else {
//             resp.status(404).json({ success: false, message: 'Invalid OTP' })
//         }
//     }
//     if (existEmployer && findUser) {

//         const valid = await compareOtp(otp, phoneNumber) //validateting the opt form the user 

//         if (valid) {
//             if (existEmployer?.role === 'employer') {

//                 const token = await generateToken(existEmployer._id) //generating the token to the exiting user according to the role 

//                 resp.status(200).json({ success: true, message: 'verifiedExitingEmployer', existEmployer, token })
//             }
//         }
//         else {
//             resp.status(404).json({ success: false, message: 'Invalid OTP' })
//         }
//     }
//     else {
//         if (findUser) {
//             const valid = await compareOtp(otp, phoneNumber)
//             if (valid) {
//                 resp.json({ success: true, message: 'New user', phoneNumber })
//             }
//             else {
//                 resp.json({ success: false, message: 'invalid otp' })
//             }
//         }
//     }
// }


const verifyOtp = async (req, resp) => {
    try {
        const { otp, contactDetails, deviceInfo } = req.body; // Add deviceInfo in the request body
        console.log(req.body, 'verify otp')
        const findUser = await otpSchema.findOne({ contactInfo: contactDetails });
        const existTrainer = await trainerSchema.findOne({ 'contactInfo.primaryNumber': contactDetails });
        const existTrainer2 = await trainerSchema.findOne({ 'contactInfo.email': contactDetails });
        const existEmployer = await employerSchema.findOne({ 'contactInfo.primaryNumber': contactDetails });
        const existEmployer2 = await employerSchema.findOne({ 'contactInfo.email': contactDetails });
        const existStudent = await studentSchema.findOne({ 'contactInfo.primaryNumber': contactDetails });
        const existStudent2 = await studentSchema.findOne({ 'contactInfo.email': contactDetails });

        console.log('findUsaer',findUser)
        if ((existTrainer2 || existTrainer) && findUser) {
            const valid = await compareOtp(otp, contactDetails);
            if (!valid) {
                return resp.status(200).json({ success: false, message: 'Invalid OTP' });
            } else {
                if (existTrainer?.role === 'trainer') {
                    const token = generateToken(existTrainer._id);
                    const session = new sessionSchema({
                        userId: existTrainer._id,
                        deviceInfo,
                    });
                    await session.save();
                    return resp.status(200).json({ success: true, message: 'verifiedExitingTrainer', existTrainer, token });
                }
                else if (existTrainer2?.role === 'trainer') {
                    const token = generateToken(existTrainer2._id);
                    const session = new sessionSchema({
                        userId: existTrainer2._id,
                        deviceInfo,
                    });
                    await session.save();
                    return resp.status(200).json({ success: true, message: 'verifiedExitingTrainer', existTrainer2, token });
                }
            }

        }
        if((existStudent || existStudent2) && findUser){
            console.log('student', existStudent, existStudent2);
            const valid = await compareOtp(otp, contactDetails);
            if (!valid) {
                return resp.status(200).json({ success: false, message: 'Invalid OTP' });
            } else {
                if(existStudent?.role === 'student'){
                    const token = generateToken(existStudent._id);
                    const session = new sessionSchema({
                        userId: existStudent._id,
                        deviceInfo,
                    });
                    await session.save();
                    return resp.status(200).json({ success: true, message: 'verifiedExitingStudent',existStudent, token });
                }
                else if(existStudent2?.role === 'student'){
                    const token = generateToken(existStudent2._id);
                    const session = new sessionSchema({
                        userId: existStudent2._id,
                        deviceInfo,
                    });
                    await session.save();
                    return resp.status(200).json({ success: true, message: 'verifiedExitingStudent',existStudent2, token });
                }
            }
        }

        if ((existEmployer || existEmployer2) && findUser) {
            const valid = await compareOtp(otp, contactDetails);
            if (!valid) {
                return resp.status(200).json({ success: false, message: 'Invalid OTP' });
            } else {
               if(existEmployer?.role === 'employer'){
                const token = generateToken(existEmployer._id);
                const session = new sessionSchema({
                    userId: existEmployer._id,
                    deviceInfo,
                });
                await session.save();
                return resp.status(200).json({ success: true, message: 'verifiedExitingEmployer',existEmployer, token });
               }
                else if(existEmployer2?.role === 'employer'){
                    const token = generateToken(existEmployer2._id);
                    const session = new sessionSchema({
                        userId: existEmployer2._id,
                        deviceInfo,
                    });
                    await session.save();
                    return resp.status(200).json({ success: true, message: 'verifiedExitingEmployer',existEmployer2, token });
                }
            }
        } else if (findUser) {
            const valid = await compareOtp(otp, contactDetails);
            if (!valid) {
                return resp.json({success: false, message: 'Invalid OTP'});
            } else {
                return resp.json({success: true, message: 'New user', contactDetails});
            }
        }
    } catch (error) {
        return resp.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//update user profile 
const updateProfile = async (req, resp) => {
    const { firstName, lastName,
        designation, company,
        location, about,
        skills, certificateHead,
        certificateDescription, certificate,
        secondaryNumber, address,
        email, website, experience } = req.body;
    const { userId } = req.params;
    const { profileImg, profileBanner } = req.file ? req.file.buffer : undefined;
    console.log(profileBanner, profileImg)
    console.log(userId);
    console.log(req.body);

    const findUser = await userSchema.findOneAndUpdate({ _id: userId }, {
        firstName: firstName ? firstName : null,
        lastName: lastName ? lastName : null,
        designation: designation ? designation : '',
        company: company ? company : null,
        location: location ? location : null,
        about: about ? about : "",
        profileImg: profileImg ? profileImg : null,
        profileBanner: profileBanner ? profileBanner : null,
        skills: skills ? skills : [],
        address: address ? address : {},
        certificateHead: certificateHead ? certificateHead : "",
        certificateDescription: certificateDescription ? certificateDescription : "",
        certificate: certificate ? [...certificate] : [],
        secondaryNumber: secondaryNumber ? secondaryNumber : "",
        website: website ? website : null,
        experiece: experience ? experience : [],
        email: email ? email : ""
    })
    await findUser.save()
    console.log(findUser);
    if (findUser) {
        return resp.status(200).json({ success: true, data: findUser })
    }
    else {
        return resp.status(404).json({ success: false, messgae: 'Something went' })
    }
}

//get all user 
const getAlluser = async (req, resp) => {
    const finduser = await userSchema.find()
    try {
        resp.status(200).json({ sucess: true, message: 'All User Fetched', finduser })
    }
    catch (err) {
        resp.status(404).json({ sucess: false, message: 'User Not found ' })
    }
}

//get user by verification 
const getuser = async (req, resp) => {
    const user = await req.user
    // console.log('get api is working')
    if (user) {
        resp.json({ sucess: true, message: 'feched', user })
    }
    else {
        resp.json({ sucess: false, message: 'not found' })
    }
}


// get user by userID
const getuserId = async (req, resp) => {
    const { userId, username } = req.params
    try {
        const user = userId ?
            await userSchema.findById(userId)
            : await userSchema.findOne({ name: username })
        resp.status(200).json({ success: true, message: 'user found', user })
    }
    catch (err) {
        resp.status(404).json({ sucess: false, message: 'User not found' })
    }
}






module.exports = { generateopt, verifyOtp, getuser, getuserId, getAlluser, updateProfile }

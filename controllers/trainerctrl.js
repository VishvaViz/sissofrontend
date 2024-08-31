const aws = require('aws-sdk')
const trainerSchema = require('../models/trainermodel');
const employerSchema = require('../models/employermodel.js')
const bookMarkedTrainingPostSchema = require('../models/bookmarkedTrainingPostmodel.js');
const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const trainerCreatePostSchema = require('../models/trainerCreatePostmodel.js')
const SkillSchema = require('../models/skillmodel.js')
const { generateToken } = require('../config/jwttoken.js')
const { compareOtp } = require('../utils/services.js');
const trainerFeedBackSchema = require('../models/trainerfeedback&reviewmodel.js')
const nofitificaitonSchema = require('../models/notificationmodel.js')
const employerPostRequriementSchema = require('../models/employerpostTrainingRequirementmodel.js')
const mongoose = require('mongoose')

require('dotenv').config()



aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

// const generateS3UploadParams = (bucketName, file) => {
//     return {
//         Bucket: bucketName,
//         Key: `${file.originalname}`, // Customize the key as needed
//         Body: file.buffer,
//         ContentType: file.mimetype
//     };
// };




const testProfileApi = async (req, resp) => {

    // const profileImg=req.file

    // let url;
    // const params=generateS3UploadParams(process.env.S3_BUCKET_NAME,profileImg)
    // const data=await s3.upload(params).promise()
    // url=data.Location
    // console.log(url)

}

const trainerSignUp = async (req, resp) => {
    const { fullName, experience, skills, contactValue, role } = req.body;
    console.log(req.body, role);
    const validNumber = /^[6-9]\d{9}$/;
    const validEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    let findTrainer;
    let trainerDetails;

    if (validNumber.test(contactValue)) {
        findTrainer = await trainerSchema.findOne({ 'contactInfo.primaryNumber': contactValue });

        if (findTrainer) {
            return resp.status(200).json({ success: false, error: "Trainer with this number already exists" });
        }

        trainerDetails = new trainerSchema({
            fullName: fullName,
            experience: experience,
            skills: skills,
            role: role,
            contactInfo: {
                primaryNumber: contactValue,
            },
        });
    } else if (validEmail.test(contactValue)) {
        findTrainer = await trainerSchema.findOne({ 'contactInfo.email': contactValue });

        if (findTrainer) {
            return resp.status(200).json({ success: false, error: "Trainer with this email already exists" });
        }

        trainerDetails = new trainerSchema({
            fullName: fullName,
            experience: experience,
            skills: skills,
            role: role,
            contactInfo: {
                email: contactValue,
            },
        });
    } else {
        return resp.status(200).json({ success: false, error: 'Not a Valid Number or Email' });
    }

    try {
        await trainerDetails.save();
        const token = generateToken(trainerDetails?._id);
        console.log('token', token);

        // Create notifications for all users
        const trainers = await trainerSchema.find(); // Assuming trainerSchema is defined and contains all trainers
        const employers = await employerSchema.find(); // Assuming employerSchema is defined and contains all employers

        // Combine both users into one array
        const allUsers = [...trainers, ...employers]; // Assuming userSchema is defined and contains all users
        const notifications = allUsers.map(user => ({
            userId: user._id,
            notifications: [{
                notifierId: trainerDetails._id,
                notifierName: fullName,
                notifierImage: '', // Add notifier image if available
                notificationType: 'New Trainer Signup',
                notificationMessage: `New trainer ${fullName} has signed up!`,
                unread: true,
                createdAt: new Date()
            }]
        }));

        await nofitificaitonSchema.insertMany(notifications);

        return resp.status(201).json({ success: true, message: 'Trainer Profile Created', trainerDetails, token });
    } catch (error) {
        console.log(error);
        return resp.status(500).json({ success: false, error: "Error in creating Trainer" });
    }
};


const trainerBasicInfoUpdate = async (req, resp) => {
    const { _id } = req.user;

    try {
        let profileImgUrl;
        if (req.files === undefined) {
            console.log('profileImg is not there');
        } else if (req.files['profileImg']) {
            const profileImg = req.files['profileImg'][0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `trainer/profile/${_id}/${profileImg.originalname}`,
                Body: profileImg.buffer,
                ContentType: profileImg.mimetype
            };
            const data = await s3.upload(params).promise();
            profileImgUrl = data.Location;
            console.log('profileimg', data.Location);
        }
        console.log('req.file', req.files['profileImg']);

        let profileBannerUrl;
        if (req.files === undefined) {
            console.log('profileBanner is not there');
        } else if (req.files['profileBanner']) {
            const profileBanner = req.files['profileBanner'][0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `trainer/profile/${_id}/${profileBanner.originalname}`,
                Body: profileBanner.buffer,
                ContentType: profileBanner.mimetype
            };
            const data = await s3.upload(params).promise();
            profileBannerUrl = data.Location;
        }

        if (req.body && req.user) {
            if (Object.keys(req.body).length > 0) {

                const trainerDetails = await trainerSchema.findByIdAndUpdate(
                    { _id },
                    {
                        $set: {
                            'basicInfo.firstName': req.body.firstName,
                            'basicInfo.lastName': req.body.lastName,
                            'basicInfo.designation': req.body.designation,
                            'basicInfo.company': req.body.company,
                            'basicInfo.age': Number(req.body.age) || 0,
                            'basicInfo.location': req.body.location,
                            'basicInfo.objective': req.body.objective,
                            'basicInfo.aboutYou': req.body.aboutYou,
                            'basicInfo.profileImg': profileImgUrl,
                            'basicInfo.profileBanner': profileBannerUrl,
                            'basicInfo.status': req.body.status,
                            'basicInfo.profileImgStatus': req.files && req.files['profileImg'] ? true : false,
                            'basicInfo.profileBannerStatus': req.files && req.files['profileBanner'] ? true : false,
                            fullName: `${req.body.firstName} ${req.body.lastName}`
                        }
                    },
                    { new: true }
                );

                await trainerDetails.save();

                // Create and save notification
                const notification = await nofitificaitonSchema.findOneAndUpdate(
                    { userId: _id },
                    {
                        $push: {
                            notifications: {
                                notifierId: _id,
                                notifierName: `${req.body.firstName} ${req.body.lastName}`,
                                notifierImage: profileImgUrl || trainerDetails?.basicInfo?.profileImg,
                                notificationType: 'Profile Update',
                                notificationMessage: `Your Profile has been updated.`,
                                unread: true,
                                createdAt: new Date()
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                if (!notification) {
                    console.log('Notification not created');
                } else {
                    console.log('Notification created successfully');
                }

                resp.status(201).json({ success: true, message: 'Basic Info Updated Successfully', trainerDetails });
            } else {
                resp.status(200).json({ success: false, message: "No request body found" });
            }
        } else {
            resp.status(200).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        const notification = await nofitificaitonSchema.findOneAndUpdate(
            { userId: _id },
            {
                $push: {
                    notifications: {
                        notifierId: _id,
                        notifierName: 'System',
                        notifierImage: trainerDetails?.basicInfo?.profileImg, // Add a default image or leave it empty
                        notificationType: 'Profile Update',
                        notificationMessage: `Server error during profile update: ${error.message}`,
                        unread: true,
                        createdAt: new Date()
                    }
                }
            },
            { upsert: true, new: true }
        );

        if (!notification) {
            console.log('Notification not created');
        } else {
            console.log('Notification created successfully');
        }

        console.log(error);
        resp.status(200).json({ success: false, error });
    }
};

const trainerProfileImageUpdate = async (req, resp) => {
    const { _id } = req.user
    // console.log(req.file);
    try {
        let profileImgUrl;
        try {

            if (req.file) {
                const profileImg = req.file;
                const params = {

                    Bucket: process.env.S3_BUCKET_NAME,
                    // region: process.env.S3_BUCKET_REGION,
                    Key: `trainer/profile/${_id}/${profileImg.originalname}`,
                    Body: profileImg.buffer,
                    ContentType: profileImg.mimetype,
                };

                const data = await s3.upload(params).promise();
                // console.log(data)
                profileImgUrl = data.Location;
            }
            // console.log(profileImgUrl);
        }
        catch (error) {
            console.log(error)


        }
        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileImg': profileImgUrl,
                    'basicInfo.profileImgStatus': true
                }
            }, { new: true }
            )
            await trainerDetails.save()
            // console.log(trainerDetails);
            resp.status(201).json({ success: true, message: 'Profile Image Updated Successfully', trainerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }

}

const trainerProfileBannerUpdate = async (req, resp) => {
    const { _id } = req.user
    try {
        let profileBannerUrl;
        if (req.file) {
            const profileBannerImg = req.file;
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                // region: process.env.S3_BUCKET_REGION,
                Key: `trainer/profile/${_id}/${profileBannerImg.originalname}`,
                Body: profileBannerImg.buffer,
                ContentType: profileBannerImg.mimetype
            };
            const data = await s3.upload(params).promise();
            console.log(data)
            profileBannerUrl = data.Location;
        }

        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileBanner': profileBannerUrl,
                    'basicInfo.profileBannerStatus': true

                }
            }, { new: true }
            )
            await trainerDetails.save()
            // console.log(trainerDetails);
            resp.status(201).json({ success: true, message: 'Profile Banner Updated Successfully', trainerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }
}

const trainerSkillsUpdate = async (req, resp) => {
    const { _id } = req.user
    try {

        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                skills: req.body?.map((skill) => skill)
            })
            trainerDetails.save()
            resp.status(201).json({ success: true, message: 'skill updated', trainerDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {
        console.log(error)
    }
}


const updateSkillRangeById = async (req, res) => {
    const { _id } = req.user;
    const { skillId } = req.params;
    const { newRange } = req.body

    try {
        // Find the trainer by ID
        const trainer = await trainerSchema.findById(_id);
        if (!trainer) {
            res.status(200).json({ success: false, message: 'user not found' });
        }
        else {

            const skillIndex = trainer.skills.findIndex(skill => skill._id.toString() === skillId);

            if (skillIndex === -1) {
                return res.status(200).json({ success: false, message: 'Skill not found' });
            }
            // Update the range of the skill
            trainer.skills[skillIndex].range = newRange;

            await trainer.save();
            res.status(201).json({ success: true, message: 'Skill range updated', trainerDetails: trainer });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const trainerCertificateUpdate = async (req, resp) => {
    const { _id } = req.user;
    const { certificateHead, institution, certificationDescription, status } = req.body
    const certificates = req.files?.['certificateImg']
    console.log('cerifitcate', certificates)
    const certificateHeadArray = Array.isArray(certificateHead) ? certificateHead : [certificateHead];
    const institutionArray = Array.isArray(institution) ? institution : [institution];
    const certificationDescriptionArray = Array.isArray(certificationDescription) ? certificationDescription : [certificationDescription];
    const statusArray = Array.isArray(status) ? status : [status];
    try {
        const uploadedCertificates = [];
        if (req.files?.['certificateImg']) {
            for (let i = 0; i < certificates.length; i++) {
                const certificate = certificates[i];
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `trainer/certificates/${_id}/${certificate.originalname}`,
                    Body: certificate.buffer,
                    ContentType: certificate.mimetype
                };

                const uploadResult = await s3.upload(params).promise();
                uploadedCertificates.push(uploadResult.Location);
            }
        }
        const certificateDetails = uploadedCertificates.map((certificateUrl, index) => ({
            certificateHead: certificateHeadArray[index % certificateHeadArray.length],
            institution: institutionArray[index % institutionArray.length],
            certificationDescription: certificationDescriptionArray[index % certificationDescriptionArray.length],
            certificateUrl: certificateUrl,
            status: statusArray[index % statusArray.length] || false
        }));

        // console.log('certificateDetails:', certificateDetails);
        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate({ _id }, {
                $addToSet: {
                    certificateDetails: certificateDetails
                }
            })
            await trainerDetails.save()
            // console.log(trainerDetails,'trainerDetails')
            resp.status(200).json({ success: true, message: "Certificate has been updated", trainerDetails })
        }
        else {
            resp.status(200).json({ message: 'You are not logged in' })
        }

    }
    catch (error) {
        resp.status(500).send(`Error processing file ${error}`);
    }
}

const trainerContactInfoUpdate = async (req, resp) => {
    const {
        primaryNumber, secondaryNumber,
        address, email,
        website, avaiableData, status
    } = req.body
    console.log(req.body)
    const { _id } = req.user
    try {
        if (!req.user) {
            return resp.status(401).json({ message: "User Not Found" });
        }
        const updateObject = {
            $set: {
                'contactInfo.primaryNumber': primaryNumber,
                'contactInfo.address': address || 'Not Available',
                'contactInfo.email': email || 'Not Provided',
                'contactInfo.website': website || 'Not Available',
                'contactInfo.status': status ? true : false,
                'contactInfo.availableDate': avaiableData ? avaiableData : new Date(),
            }

        }
        if (secondaryNumber) {
            updateObject.$set['contactInfo.secondaryNumber'] = secondaryNumber
        }
        // const trainerDetails = await trainerSchema.findOneAndUpdate({ _id }, {
        //     $set: {
        //         'contactInfo.primaryNumber': primaryNumber,
        //         'contactInfo.secondaryNumber': secondaryNumber || 0,
        //         'contactInfo.address': address || 'Not Available',
        //         'contactInfo.email': email || 'Not Provided',
        //         'contactInfo.website': website || 'Not Available',
        //         'contactInfo.status': status ? true : false,
        //         'contactInfo.availableDate': avaiableData ? avaiableData : new Date(),
        //     }
        // })
        const trainerDetails = await trainerSchema.findOneAndUpdate({ _id }, updateObject)
        await trainerDetails.save()
        console.log(trainerDetails, 'trainerDetails')
        if (trainerDetails) {
            resp.status(201).json({ success: true, message: 'Contact Info Updated Successfully', trainerDetails })
        }
        else {
            resp.status(200).json({ success: false, message: 'User Not Found' })
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ message: error.toString() })
    }

}

const trainerExperienceInfoUpdate = async (req, resp) => {
    const {
        expertIn, experience,
        sinceInTheFiled, recentCompany,
        trainingSession,
        status
    } = req.body
    // console.log(req.body)
    const { _id } = req.user
    try {
        if (!req.user) {
            return resp.status(200).json({ message: "User Not Found" });
        }
        else {

            const trainerDetails = await trainerSchema.findOneAndUpdate({ _id }, {
                $set: {
                    'experiences.expertIn': expertIn || '-',
                    'experiences.experience': experience || 0,
                    'experiences.sinceInTheFiled': sinceInTheFiled || 0,
                    'experiences.recentCompany': recentCompany || 'Not Provided',
                    'experiences.status': status ? true : false,
                    'experiences.trainingSession': trainingSession || 0
                }
            })
            await trainerDetails.save()
            // console.log(trainerDetails, 'trainerDetails')
            if (trainerDetails) {
                resp.status(201).json({ success: true, message: 'Experience Info Updated Successfully', trainerDetails })
            }
            else {
                resp.status(200).json({ success: false, message: 'User Not Found' })
            }
        }
    }
    catch (error) {
        console.log('error', error)
        resp.status(200).json({ message: error.toString() })
    }

}

const trainerCertificateDelete = async (req, resp) => {
    const { _id } = req.user;

    const certificateIdToDelete = req.params.id; // Assuming you're passing the experience ID as a URL parameter
    try {
        if (req.user) {
            const trainerDetails = await trainerSchema.findByIdAndUpdate(
                _id,
                { $pull: { certificateDetails: { _id: certificateIdToDelete } } },
                { new: true }
            );

            await trainerDetails.save()
            resp.status(200).json({ success: true, message: "Certificate data has been deleted", trainerDetails });
        } else {
            resp.status(401).json({ message: 'You are not logged in' });
        }
    } catch (error) {
        resp.status(500).json({ message: error.toString() });
    }
};

const getSkills = async (req, resp) => {
    try {
        const skills = await SkillSchema.find()

        if (!skills) {
            resp.status(200).json({ success: false, message: "No Data Found" })

        } else {
            resp.status(201).json({ success: true, message: 'getting skills', skills })
        }
    } catch (error) {
        console.log(error)

    }
}


const gettrainerProfile = async (req, resp) => {
    const trainerDetails = await req.user
    // console.log("User details",trainerDetails)
    if (trainerDetails) {
        resp.status(200).json({ success: true, message: 'trainerProfileFected', trainerDetails })
    }
    else {
        resp.status(403).json({ sucess: false, message: "You are not authorized to access this api" })
    }
}



const addBookMarkedPost = async (req, res) => {
    try {
        const { _id } = req.user;
        const postDetails = req.body; // Assuming _id is the field identifying the post

        // Check if the current user already has a bookmarked document
        let userBookmarks = await bookMarkedTrainingPostSchema.findOne({ userId: _id });

        if (!userBookmarks) {
            // If the current user doesn't exist, create a new document
            userBookmarks = new bookMarkedTrainingPostSchema({
                userId: _id,
                postDetails: [postDetails]
            });
            await userBookmarks.save();
            return res.status(201).json({ success: true, message: 'Post Bookmarked Successfully', userBookmarks });
        }

        // Check if the post is already bookmarked
        const existingPostIndex = userBookmarks.postDetails.findIndex(detail => detail._id === postDetails._id);

        if (existingPostIndex !== -1) {
            // If the post is already bookmarked, delete its details
            userBookmarks.postDetails.splice(existingPostIndex, 1);
            await userBookmarks.save();
            return res.status(200).json({ success: true, message: 'Post Unbookmarked Successfully', userBookmarks });
        }
        else {
            // If the user exists and the post is not already bookmarked, add the new postDetails
            userBookmarks.postDetails.unshift(postDetails);
            await userBookmarks.save();
        }

        // Return a success response
        return res.status(201).json({ success: true, message: 'Post Bookmarked Successfully', userBookmarks });

    } catch (error) {
        console.error(error);
        // Return an error response if an error occurs
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const getBookMarkedPostsByUserId = async (req, resp) => {
    const { _id } = req.user;

    try {
        const findBookMarkedPost = await bookMarkedTrainingPostSchema.findOne({ userId: _id })

        if (!findBookMarkedPost) {
            resp.status(200).json({ success: false, message: "No Data Found" })
        }
        else {
            resp.status(201).json({ success: true, userBookmarks: findBookMarkedPost })
        }
    }
    catch (error) {
        console.log(error)
    }
};



const trainerAppliedTraining = async (req, resp) => {
    try {
        const { _id } = req.user;
        const { trainingPostId } = req.params;
        const { trainingDetails } = req.body;

        console.log('trainingDetails', trainingDetails);

        // Check if the trainer has already applied for this training
        const existingApplication = await trainerAppliedTrainingSchema.findOne({
            trainerId: _id,
            'trainingDetails.trainingPostDetails._id': trainingPostId,
        });

        if (existingApplication) {
            console.log('Already applied');
            return resp.status(200).json({ success: false, message: 'Already Applied' });
        } else {
            const findTraining = await employerPostRequriementSchema.findOne({
                _id: trainingPostId,
                'applicants.appliedBy': _id,
            });
            if (findTraining) {
                resp.status(200).json({ success: false, message: 'Already Applied' });
            } else {
                // Update the training post to include this applicant
                await employerPostRequriementSchema.findByIdAndUpdate(
                    trainingPostId,
                    {
                        $push: {
                            applicants: {
                                appliedBy: _id,
                                appliedStatus: true,
                                application: 'Pending',
                                _id: _id
                            },
                        },
                    },
                    { new: true }
                );
            }

            const findApplication = await trainerAppliedTrainingSchema.findOne({ "trainerId": _id });
            if (findApplication) {
                findApplication.trainingDetails.unshift(trainingDetails);
                await findApplication.save();

                // Create and save notification
                await nofitificaitonSchema.findOneAndUpdate(
                    { userId: _id },
                    {
                        $push: {
                            notifications: {
                                notifierId: _id,
                                notifierName: 'System',
                                notificationType: 'Training Application',
                                notificationMessage: 'Your training application has been submitted successfully.',
                                unread: true,
                                createdAt: new Date()
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                return resp.status(201).json({ success: true, message: 'Application Applied' });
            } else {
                const newApplication = new trainerAppliedTrainingSchema({
                    trainerId: _id,
                    trainingDetails: [
                        {
                            trainingPostDetails: trainingDetails?.trainingPostDetails,
                        }
                    ]
                });

                if (newApplication) {
                    await newApplication.save();

                    // Create and save notification
                    await nofitificaitonSchema.findOneAndUpdate(
                        { userId: _id },
                        {
                            $push: {
                                notifications: {
                                    notifierId: _id,
                                    notifierName: 'System',
                                    notificationType: 'Training Application',
                                    notificationMessage: 'Your training application has been submitted successfully.',
                                    unread: true,
                                    createdAt: new Date()
                                }
                            }
                        },
                        { upsert: true, new: true }
                    );

                    return resp.status(201).json({ success: true, message: "Training application submitted successfully." });
                } else {
                    return resp.status(400).json({ success: false, message: "Something went wrong" });
                }
            }
        }
    } catch (error) {
        console.error(error);

        // Create and save error notification
        await nofitificaitonSchema.findOneAndUpdate(
            { userId: req.user._id },
            {
                $push: {
                    notifications: {
                        notifierId: req.user._id,
                        notifierName: 'System',
                        notificationType: 'Error',
                        notificationMessage: `Server error during training application: ${error.message}`,
                        unread: true,
                        createdAt: new Date()
                    }
                }
            },
            { upsert: true, new: true }
        );

        resp.status(500).json({ success: false, message: 'Server Error' });
    }
};

//for trainer 
const getAppliedTraining = async (req, resp) => {
    const { _id } = req.user;
    try {

        const findAppliedTraining = await trainerAppliedTrainingSchema.findOne({ "trainerId": _id }).populate('trainingDetails.trainingPostDetails')
        const trainingPostData = findAppliedTraining?.trainingDetails?.map(({ trainingPostDetails, appliedStatus, applicationstatus, _id, trainingResources,enableTraining, feedBackDetails }) => {
            return {
                trainingPostDetails,
                appliedStatus,
                applicationstatus,
                enableTraining,
                _id,
                trainingResources,
                feedBackDetails
            };
        });

//         const trainingPostData = await trainerAppliedTrainingSchema.aggregate([
//             {
//                 $match: {
//                     "trainerId": _id
//                 },
//             },
//             // {
//             //     $addFields: {
//             //         trainingDetails: {
//             //             $map: {
//             //                 input: "$trainingDetails",
//             //                 as: "training",
//             //                 in: {
//             //                     _id: "$$training._id",
//             //                     postId: { $toObjectId: "$$training.trainingPostDetails._id" },
//             //                     // postedById:{$toObjectId: "$$training.trainingPostDetails.postedById"},
//             //                     // appliedStatus: "$$training.appliedStatus",
//             //                     // applicationstatus: "$$training.applicationstatus",
//             //                     // trainingResources: "$$training.trainingResources",
//             //                     // feedBack: '$$training.feedBackDetails',
//             //                 }
//             //             }
//             //         }
//             //     }
//             // },
//             {
//                 $unwind:'$trainingDetails.trainingPostDetails'
//             },
//             {
//                 $addFields:{
//                     postId:{$toObjectId:'$trainingDetails.trainingPostDetails._id'},
//                 }
//             },
//             {
//                 $lookup:{
//                     from: 'employerpostrequirements',
//                     localField: 'postId',
//                     foreignField: '_id',
//                     as: 'postDetails'
//                 }
//             },

//   {
//     $unwind: '$postDetails' // deconstructs the array field to objects
//   },
//             // {
//             //     $lookup:{
//             //         from:"employers",
//             //         localField: 'postDetails.postedById',
//             //         foreignField: '_id',
//             //         as: 'postedBy'
//             //     }
//             // },
                
//             // {
//             //     $set: {
//             //         postedByName: '$postedBy.fullName',
//             //         postedByComapnyName: '$postedBy.companyName',
//             //         postedByDesignation: '$postedBy.designation',

//             //     }
//             // },
//             // {
//             //     $addFields:{

//             //     }

//             // },
//             // {
//                 // $project: {
//                     // postDetails:1,
//                     // postDetails:{comments:0},
//                     // postedBy:1,
//                     // trainingDetails:1
//                 // }

//             // }

//         ])


        resp.status(201).json({ success: true, message: ' Data is fetching', trainingPostData });

    }
    catch (error) {
        console.log(error);
        resp.status(200).json({ success: false, message: "Data not found" })
    }
}

//add training resources notes;

const addTrainingResources = async (req, resp) => {

    const { _id } = req.user
    const { trainingDetailsId } = req.params
    const fileData = req.files['fileData']
    const fileNameArray = Array.isArray(req.body.fileName) ? req.body.fileName : [req.body.fileName]
    const fileOriginalNameArray = Array.isArray(req.body.fileOriginalName) ? req.body.fileOriginalName : [req.body.fileOriginalName]
    try {
        const uploadResources = []
        if (req.files['fileData']) {
            for (let i = 0; i < fileData.length; i++) {
                const resourcesFile = fileData[i];
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `trainer/resourcesFiles/${_id}/${resourcesFile.originalname}`,
                    Body: resourcesFile.buffer,
                    ContentType: resourcesFile.mimetype
                };
                const uploadResult = await s3.upload(params).promise();
                uploadResources.push(uploadResult.Location);
                // uploadResources.push(resourcesFile.originalname)
            }
        }
        const trainingResources = uploadResources.map((files, index) => ({
            fileName: fileNameArray[index % fileNameArray.length],
            fileData: files,
            fileOriginalName: fileOriginalNameArray[index % fileOriginalNameArray.length],

        }))
        // console.log("trainingResources", trainingResources)
        const addTrainingResources = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: _id,
                'trainingDetails._id': trainingDetailsId// Filter by both trainerId and trainingDetailsId
            },
            {

                $push: {
                    'trainingDetails.$.trainingResources': trainingResources
                }
            },
            { new: true }  // This returns the updated data from the db
        )
        await addTrainingResources.save()

        console.log(addTrainingResources)
        if (addTrainingResources) {
            const findAppliedTraining = await trainerAppliedTrainingSchema.findOne({ "trainerId": _id }).populate('trainingDetails.trainingPostDetails')
            const trainingPostData = findAppliedTraining.trainingDetails.map(({ trainingPostDetails, appliedStatus, applicationstatus, _id, trainingResources, feedBackDetails }) => {
                // Destructure the `tocFile` key from `trainingPostDetails`
                // const { tocFile, ...updatedTrainingPostDetails } = trainingPostDetails;
                // Return the updated `trainingPostDetails` object without the `tocFile` key
                return {
                    trainingPostDetails,
                    appliedStatus,
                    applicationstatus,
                    _id,
                    trainingResources,
                    feedBackDetails
                };
            });
            resp.status(201).json({ success: true, message: 'Resouces Added', trainingPostData })
        }
        else {
            resp.status(200).json({ success: false, message: 'Failed to Add Resources' })
        }

    }
    catch (error) {
        console.log('error', error)
    }
}



const deleteAppliedTraining = async (req, resp) => {
    const { _id } = req.user
    const { trainingPostId } = req.params
    try {
        const findAppliedTraining = await trainerAppliedTrainingSchema.findOne({ trainerId: _id, })
        if (!findAppliedTraining) {
            return resp.status(404).json({ success: false, message: 'Applied training not found.' });
        }

        else {
            // Use $pull operator to remove the matching training post from the array atomically
            const updatedTraining = await trainerAppliedTrainingSchema.findOneAndUpdate(
                { trainerId: _id },
                { $pull: { trainingDetails: { _id: trainingPostId } } },
                { new: true } // Return the updated document
            );

            if (!updatedTraining) {
                return resp.status(404).json({ success: false, message: 'Training post not found in the applied trainings.' });
            }
            else {
                resp.status(200).json({ success: true, message: 'Training post deleted successfully.', updatedTraining });
            }
            // console.log(updatedTraining); 
        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ success: false, message: 'Internal Server Error', error })
    }


}

// get all training details 
const getAllTrainerDetails = async (req, resp) => {
    // console.log('req.query', req.query)
    const trainerDetails = await trainerSchema.find()
    if (trainerDetails) {
        resp.status(201).json({ success: true, message: 'TrainerDataFected', trainerDetails })
    }
    else {
        resp.status(200).json({ success: false, message: 'Internal Server Error' })
    }
}

//get trainerDetail by using the Id 


const getTrainerDetailsById = async (req, resp) => {
    const { id } = req.params
    try {
        const trainerDetails = await trainerSchema.findOne({ _id: id })

        if (!trainerDetails) {
            resp.status(200).json({ success: false, message: "No User Found" })
        }
        else {
            const findFeedBack = await trainerFeedBackSchema.aggregate([
                {
                    "$match": {
                        "trainerId": new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $unwind: '$feedBackDetails'
                },
                {
                    $lookup: {
                        from: 'employers',
                        localField: 'feedBackDetails.reviewedById',
                        foreignField: "_id",
                        as: "employerDetails"
                    }
                },
                // {
                //     $set: {
                //         'employerDetails': { $first: '$employerDetails' }
                //     }
                // },
                {
                    $set: {
                        'feedBackDetails.reviewedByName': { $arrayElemAt: ['$employerDetails.fullName', 0] },
                        'feedBackDetails.reviewedByDesignation': { $arrayElemAt: ['$employerDetails.designation', 0] },
                        'feedBackDetails.reviewedByImg': { $arrayElemAt: ['$employerDetails.basicInfo.profileImg', 0] }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        trainerId: { $first: '$trainerId' },
                        feedBackDetails: { $push: '$feedBackDetails' },
                        averageRating: { $avg: '$feedBackDetails.rating' },
                    }
                },
                // {
                //     "$project": {
                //         '_id': 1,
                //         'rating': 1,
                //         'feedBack': 1,
                //         'feedBackDetails': 1,
                //         "reviewedByName": 1,
                //         "reviewedByDesignation": 1,
                //         "reviewedByImg": 1,
                //         // 'trainingDetails': 1,
                //     }
                // },
                {
                    $project: {
                        _id: 1,
                        trainerId: 1,
                        feedBackDetails: 1,
                        averageRating: 1
                    }

                }
            ])
            resp.status(201).json({ success: true, message: 'Trainer Details Fetched', trainerDetails, findFeedBack })
        }

    }
    catch (error) {
        resp.status(200).json({ success: false, message: "Server Error", error })
    }

}

const UpdatePhoneNumber = async (req, resp) => {

    const isEmail = (value) => {
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(value);
    };

    const {
        contactDetails,
        oldContactInfo,
        otp
    } = req.body

    console.log('req.body', req.body);
    const { _id } = req.user

    try {
        if (req.user) {
            const valid = await compareOtp(otp, contactDetails)
            if (valid) {

                // Check if the new contact details are already used
                const userField = isEmail(contactDetails) ? 'contactInfo.email' : 'contactInfo.primaryNumber';

                const trainerExists = await trainerSchema.findOne({ [userField]: contactDetails });
                const employerExists = await employerSchema.findOne({ [userField]: contactDetails });

                if (trainerExists || employerExists) {
                    return resp.status(200).json({ success: false, message: 'Contact Details Already Used' });
                }

                // Find the user using the old contact info
                const oldUserField = isEmail(oldContactInfo) ? 'contactInfo.email' : 'contactInfo.primaryNumber';
                const findUser = await trainerSchema.findOne({ [oldUserField]: oldContactInfo });

                if (!findUser) {
                    resp.status(200).json({ success: false, message: 'User Details Not Found' })
                }
                else {
                    const updateData = isEmail(contactDetails) ? { 'contactInfo.email': contactDetails } : { 'contactInfo.primaryNumber': contactDetails }

                    const trainerDetails = await trainerSchema.findOneAndUpdate(
                        { _id },
                        { $set: updateData },
                        { new: true })

                    if (trainerDetails) {
                        await trainerDetails.save()
                        resp.status(201).json({ success: true, message: 'Trainer Contact Details Updated SuccessFully', trainerDetails })
                    }
                    else {
                        resp.status(200).json({ success: false, message: 'Error Updating Contact Details' })
                    }
                }
            }
            else {
                resp.status(200).json({ success: false, message: 'Invalid Otp' })

            }

        }
    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ message: error.toString() })
    }


}

const trainerSearchHistory = async (req, res) => {
    try {
        const trainer = await trainerSchema.find();
        res.json(trainer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getFeedBack = async (req, resp) => {
    const { trainerId } = req.params

    try {
        const findFeedBack = await trainerFeedBackSchema.aggregate([
            {
                "$match": {
                    "trainerId": new mongoose.Types.ObjectId(trainerId)
                }
            },
            {
                $unwind: '$feedBackDetails'
            },
            {
                $lookup: {
                    from: 'employers',
                    localField: 'feedBackDetails.reviewedById',
                    foreignField: "_id",
                    as: "employerDetails"
                }
            },
            // {
            //     $set: {
            //         'employerDetails': { $first: '$employerDetails' }
            //     }
            // },
            {
                $set: {
                    'feedBackDetails.reviewedByName': { $arrayElemAt: ['$employerDetails.fullName', 0] },
                    'feedBackDetails.reviewedByDesignation': { $arrayElemAt: ['$employerDetails.designation', 0] },
                    'feedBackDetails.reviewedByImg': { $arrayElemAt: ['$employerDetails.basicInfo.profileImg', 0] }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    trainerId: { $first: '$trainerId' },
                    feedBackDetails: { $push: '$feedBackDetails' },
                    averageRating: { $avg: '$feedBackDetails.rating' },
                }
            },
            // {
            //     "$project": {
            //         '_id': 1,
            //         'rating': 1,
            //         'feedBack': 1,
            //         'feedBackDetails': 1,
            //         "reviewedByName": 1,
            //         "reviewedByDesignation": 1,
            //         "reviewedByImg": 1,
            //         // 'trainingDetails': 1,
            //     }
            // },
            {
                $project: {
                    _id: 1,
                    trainerId: 1,
                    feedBackDetails: 1,
                    averageRating: 1
                }

            }
        ])
        resp.status(201).json({ success: true, message: 'feedback', findFeedBack })

        // console.log('feedback', findFeedBack)
    }
    catch (error) {
        console.log(error)
    }

}



const getNotifications = async (req, resp) => {
    const { userId } = req.params;
    // console.log('userId',userId)

    try {
        if (userId?.length > 0) {

            const notifications = await nofitificaitonSchema.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $unwind: '$notifications' // Deconstruct notifications array
                },
                {
                    $lookup: {
                        from: 'employers',
                        localField: 'notifications.notifierId',
                        foreignField: '_id',
                        as: 'employerDetails'
                    }
                },
                {
                    $set: {
                        'notifications.notifierName': { $arrayElemAt: ['$employerDetails.fullName', 0] },
                        'notifications.notifierImage': { $arrayElemAt: ['$employerDetails.basicInfo.profileImg', 0] }
                    }
                },
                {
                    $match: {
                        'notifications.unread': true
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        userId: { $first: '$userId' },
                        notifications: { $push: '$notifications' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        notifications: 1
                    }
                }
            ]);

            resp.status(200).json({ success: true, notifications });
        }
        else {
            console.log('user id not found')
            resp.status(200).json({ success: false, message: 'User Not Found' })
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        resp.status(200).json({ success: false, message: 'Internal server error' });
    }
};

const updateReadNotification = async (req, resp) => {
    const { notificationId } = req.params;
    const { userId } = req.body
    console.log('api hit')
    console.log('notificaitonid', notificationId)
    console.log('userId', userId)
    try {

        const notification = await nofitificaitonSchema.findOneAndUpdate({
            userId: userId,
            'notifications._id': notificationId
        },
            {
                $set: {
                    'notifications.$.unread': false
                }
            }, {
            new: true
        })
        if (notification) {
            const notifications = await nofitificaitonSchema.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $unwind: '$notifications' // Deconstruct notifications array
                },
                {
                    $lookup: {
                        from: 'employers',
                        localField: 'notifications.notifierId',
                        foreignField: '_id',
                        as: 'employerDetails'
                    }
                },
                {
                    $set: {
                        'notifications.notifierName': { $arrayElemAt: ['$employerDetails.fullName', 0] },
                        'notifications.notifierImage': { $arrayElemAt: ['$employerDetails.basicInfo.profileImg', 0] }
                    }
                },
                {
                    $match: {
                        'notifications.unread': true
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        userId: { $first: '$userId' },
                        notifications: { $push: '$notifications' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        notifications: 1
                    }
                }
            ]);
            if (notification && notifications) {
                resp.status(200).json({ success: true, message: 'Notifications Updated', notifications })
            }
            else {
                resp.status(200).json({ success: false, message: 'No Notification Found' })

            }
        }
        else {
            resp.status(200).json({ success: false, message: 'No Notification Found' })
        }


    }
    catch (error) {
        console.log(error)
        resp.status(200).json({ success: false, message: 'Internal Server Error' })
    }

}

const deleteAllNotification = async (req, resp) => {
    const { userId } = req.body;
    try {

        const notification = await nofitificaitonSchema.findOneAndReplace({
            userId: userId
        },
            {
                userId: userId,
                notifications: []
            },
            {
                new: true
            }

        )
        if (notification) {
            resp.status(200).json({ success: true, message: 'Notification Deleted Successfully', notification })
        }
        else {
            resp.status(200).json({ success: false, message: 'Notification Not Found' })
        }

    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Internal Server Error' })

    }


}


module.exports = {
    trainerSignUp, gettrainerProfile, trainerBasicInfoUpdate, updateSkillRangeById,
    trainerSkillsUpdate, trainerCertificateUpdate, trainerContactInfoUpdate, trainerProfileBannerUpdate,
    trainerExperienceInfoUpdate, trainerCertificateDelete, getTrainerDetailsById, getSkills,
    addBookMarkedPost, getBookMarkedPostsByUserId, trainerProfileImageUpdate,
    trainerAppliedTraining, getAppliedTraining, deleteAppliedTraining, addTrainingResources,
    testProfileApi,
    getAllTrainerDetails, UpdatePhoneNumber, trainerSearchHistory, getFeedBack, getNotifications, updateReadNotification,
    deleteAllNotification
}

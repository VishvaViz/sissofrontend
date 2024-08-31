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
const studentSchema = require('../models/studentmodel.js')
const mongoose = require('mongoose')
const jobSchema = require('../models/jobmodel.js');

require('dotenv').config()

aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

const studentSignUp = async (req, resp) => {
    const { fullName, degree, skills, contactValue, role } = req.body;
    console.log(req.body, "role");
    const validNumber = /^[6-9]\d{9}$/;
    const validEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    let findStudent;
    let studentDetails;

    if (validNumber.test(contactValue)) {
        findStudent = await studentSchema.findOne({ 'contactInfo.primaryNumber': contactValue });

        if (findStudent) {
            return resp.status(200).json({ success: false, error: "Student with this number already exists" });
        }

        studentDetails = new studentSchema({
            fullName: fullName,
            degree: degree,
            skills: skills,
            role: role,
            contactInfo: {
                primaryNumber: contactValue,
            },
        });
    } else if (validEmail.test(contactValue)) {
        findStudent = await studentSchema.findOne({ 'contactInfo.email': contactValue });

        if (findStudent) {
            return resp.status(200).json({ success: false, error: "Student with this email already exists" });
        }

        studentDetails = new studentSchema({
            fullName: fullName,
            degree: degree,
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
        await studentDetails.save();
        const token = generateToken(studentDetails?._id);
        console.log('token', token);

        // Create notifications for all users
        const trainers = await trainerSchema.find(); // Assuming trainerSchema is defined and contains all trainers
        const employers = await employerSchema.find(); // Assuming employerSchema is defined and contains all employers
        const students = await studentSchema.find({ _id: { $ne: studentDetails._id } }); // Assuming studentSchema is defined and contains all students
        // Combine both users into one array
        const allUsers = [...trainers, ...employers, ...students]; // Assuming userSchema is defined and contains all users
        const notifications = allUsers.map(user => ({
            userId: user._id,
            notifications: [{
                notifierId: studentDetails._id,
                notifierName: fullName,
                notifierImage: '', // Add notifier image if available
                notificationType: 'New Student Signup',
                notificationMessage: `New Student ${fullName} has signed up!`,
                unread: true,
                createdAt: new Date()
            }]
        }));

        await nofitificaitonSchema.insertMany(notifications);

        return resp.status(201).json({ success: true, message: 'Student Profile Created', studentDetails, token });
    } catch (error) {
        console.log(error);
        return resp.status(500).json({ success: false, error: "Error in creating Student" });
    }
};

const studentBasicInfoUpdate = async (req, resp) => {
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

                const studentDetails = await studentSchema.findByIdAndUpdate(
                    { _id },
                    {
                        $set: {
                            'basicInfo.firstName': req.body.firstName,
                            'basicInfo.lastName': req.body.lastName,
                            'basicInfo.occupation': req.body.occupation,
                            'basicInfo.age': Number(req.body.age) || 0,
                            'basicInfo.location': req.body.location,
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

                await studentDetails.save();

                // Create and save notification
                const notification = await nofitificaitonSchema.findOneAndUpdate(
                    { userId: _id },
                    {
                        $push: {
                            notifications: {
                                notifierId: _id,
                                notifierName: `${req.body.firstName} ${req.body.lastName}`,
                                notifierImage: profileImgUrl || studentDetails?.basicInfo?.profileImg,
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

                resp.status(201).json({ success: true, message: 'Basic Info Updated Successfully', studentDetails });
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
                        notifierImage: studentDetails?.basicInfo?.profileImg, // Add a default image or leave it empty
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

const studentProfileImageUpdate = async (req, resp) => {
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
            const studentDetails = await studentSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileImg': profileImgUrl,
                    'basicInfo.profileImgStatus': true
                }
            }, { new: true }
            )
            await studentDetails.save()
            // console.log(trainerDetails);
            resp.status(201).json({ success: true, message: 'Profile Image Updated Successfully', studentDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }

}
const studentProfileBannerUpdate = async (req, resp) => {
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
            const studentDetails = await studentSchema.findByIdAndUpdate({ _id }, {
                $set: {
                    'basicInfo.profileBanner': profileBannerUrl,
                    'basicInfo.profileBannerStatus': true

                }
            }, { new: true }
            )
            await studentDetails.save()
            // console.log(trainerDetails);
            resp.status(201).json({ success: true, message: 'Profile Banner Updated Successfully', studentDetails });
        }
        else {
            resp.status(200).json({ success: false, message: 'Unauthorized' })
        }
    }
    catch (error) {

    }
}
const studentSkillsUpdate = async (req, resp) => {
    const { _id } = req.user
    try {

        if (req.user) {
            const studentDetails = await studentSchema.findByIdAndUpdate({ _id }, {
                skills: req.body?.map((skill) => skill)
            })
            studentDetails.save()
            resp.status(201).json({ success: true, message: 'skill updated', studentDetails });
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
        const student = await studentSchema.findById(_id);
        if (!student) {
            res.status(200).json({ success: false, message: 'user not found' });
        }
        else {

            const skillIndex = student.skills.findIndex(skill => skill._id.toString() === skillId);

            if (skillIndex === -1) {
                return res.status(200).json({ success: false, message: 'Skill not found' });
            }
            // Update the range of the skill
            student.skills[skillIndex].range = newRange;

            await student.save();
            res.status(201).json({ success: true, message: 'Skill range updated', studentDetails: student });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addStudentEducation = async (req,res) => {
    const studentId = req.params.id;
    const educationEntry = req.body; // Expecting a single education entry object

    try {
        const student = await studentSchema.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Add the new education entry to the student's education array
        student.education.push(educationEntry);

        // Save the updated student document
        await student.save();

        return res.status(200).json({ success: true, message: 'Education entry added successfully', student });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error adding education entry' });
    }
};

const editEducation = async (req, res) => {
        const { studentId, educationIndex } = req.params;
        const updatedEducationEntry = req.body; // Expecting an object with the updated education entry details
    
        try {
            const student = await studentSchema.findById(studentId);
    
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
    
            // Check if the provided education index is valid
            if (educationIndex < 0 || educationIndex >= student.education.length) {
                return res.status(400).json({ success: false, message: 'Invalid education index' });
            }
    
            // Update the specific education entry
            student.education[educationIndex] = {
                ...student.education[educationIndex]._doc, // Preserve other fields if partial update is required
                ...updatedEducationEntry
            };
    
            // Save the updated student document
            await student.save();
    
            return res.status(200).json({ success: true, message: 'Education entry updated successfully', student });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error updating education entry' });
        }
    };

const deleteEducation = async (req, res) => {
    const { studentId, educationIndex } = req.params;

    try {
        const student = await studentSchema.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Check if the provided education index is valid
        if (educationIndex < 0 || educationIndex >= student.education.length) {
            return res.status(400).json({ success: false, message: 'Invalid education index' });
        }

        // Remove the specific education entry
        student.education.splice(educationIndex, 1);

        // Save the updated student document
        await student.save();

        return res.status(200).json({ success: true, message: 'Education entry deleted successfully', student });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error deleting education entry' });
    }
};

const updateContactInfo = async (req, res) => {
    const { studentId } = req.params;
    const contactInfoUpdate = req.body;

    try {
        // Find the student by ID and update the contactInfo
        const updatedStudent = await studentSchema.findByIdAndUpdate(
            studentId,
            { $set: { contactInfo: contactInfoUpdate } },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        return res.status(200).json({ success: true, message: 'Contact info updated successfully', student: updatedStudent });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error updating contact info' });
    }
};
const getstudentProfile = async (req, resp) => {
    const studentDetails = await studentSchema.findById(req.user._id);
    // console.log("User details",trainerDetails)
    if (studentDetails) {
        resp.status(200).json({ success: true, message: 'Student Details', studentDetails })
    }
    else {
        resp.status(403).json({ sucess: false, message: "You are not authorized to access this api" })
    }
}
const postJob = async (req, res) => {
    const { jobId, status, email, phoneNo, coverLetter, createdBy } = req.body;
    // const { _id } = req.body;  // Assuming the user is authenticated and the user ID is available in req.user
    console.log(req.files,"FILES")
    try {
        let resumeUrl;

        if (req.files && req.files['resume']) {
            const resume = req.files['resume'][0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `jobApplications/resumes/${resume.originalname}`,
                Body: resume.buffer,
                ContentType: resume.mimetype
            };
            const data = await s3.upload(params).promise();
            resumeUrl = data.Location;
            console.log('Resume uploaded to S3:', data.Location);
        } else {
            console.log('Resume file is not present');
        }

        const job = new jobSchema({
            jobId,
            status,
            email,
            phoneNo,
            resume: resumeUrl,
            coverLetter,  // coverLetter can be optional
            createdBy: '66b31460f806d2e5fa4e2ec0',
        });
        const savedJob = await job.save();
        res.status(201).json({ success: true, message: 'Job posted successfully', job: savedJob });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to post job', error: error.message });
    }
};

module.exports = {
    studentSignUp, studentBasicInfoUpdate, studentProfileImageUpdate,studentProfileBannerUpdate,studentSkillsUpdate,updateSkillRangeById,addStudentEducation, editEducation, deleteEducation, updateContactInfo, getstudentProfile, postJob
};

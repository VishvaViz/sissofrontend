// employerSignUp  controller
const employerSchema = require("../models/employermodel.js");
const trainerSchema = require("../models/trainermodel");
const { generateToken } = require("../config/jwttoken.js");
const trainerAppliedTrainingSchema = require("../models/trainerappliedtrainingmodel.js");
const postTrainingRequirementSchema = require("../models/employerpostTrainingRequirementmodel");
const bookmarkedEmployerSchema = require("../models/bookmarkedEmployerPostmodel.js");
const SkillSchema = require("../models/skillmodel.js");
const { compareOtp } = require("../utils/services.js");
const nofitificaitonSchema = require("../models/notificationmodel.js");
const mongoose = require("mongoose");
const aws = require("aws-sdk");
require("dotenv").config();

aws.config.update({
  accessKeyId: process.env.S3_ACCESSKEY_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_BUCKET_REGION,
});
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
  // const params=generateS3UploadParams('sisso-data',profileImg)
  // const data=await s3.upload(params).promise()
  // url=data.Location
  // console.log(url)
};

// const employerSignUp = async (req, resp) => {
//     const { fullName, companyName, designation, primaryNumber, email, role } = req.body;
//     console.log('req.body',req.body)
//     const validNumber = /^[6-9]\d{9}$/
//     // condition for the employer using the mobile number for signup
//     if (validNumber.test) {
//         const findEmployer = await employerSchema.findOne({
//             'contactInfo.primaryNumber': primaryNumber
//         })
//         if (!findEmployer) {
//             try {
//                 const employerDetails = new employerSchema({
//                     fullName: fullName,
//                     companyName: companyName,
//                     designation: designation,
//                     role: role,
//                     contactInfo: {
//                         primaryNumber: primaryNumber,
//                         // email: email
//                     },
//                 });
//                 if (employerDetails) {
//                     await employerDetails.save();
//                     resp.status(201).json({ success: true, message: 'Employer Profile Created ' })
//                 }
//             }
//             catch (error) {
//                 console.log(error)
//                 resp.status(200).json({ success: false, error: "Error in creating employer" })
//             }
//         }
//         else {
//             resp.status(200).json({ success: false, error: "Employer with this number already" })
//         }
//     }
//     else {
//          resp.status(200).json({ success: false, error: 'No a Valid Number' })
//     }

//     const validEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
//     // condition for the employer using the email for signup
//     if (validEmail.test(email)) {
//         const findEmployer = await employerSchema.findOne({
//             'contactInfo.primaryNumber': primaryNumber
//         })
//         if (!findEmployer) {
//             try {
//                 const employerDetails = new employerSchema({
//                     fullName: fullName,
//                     companyName: companyName,
//                     designation: designation,
//                     role: role,
//                     contactInfo: {
//                         // primaryNumber: primaryNumber,
//                         email: email
//                     },
//                 });
//                 if (employerDetails) {
//                     await employerDetails.save();
//                     resp.status(201).json({ success: true, message: 'Employer Profile Created ' })
//                 }
//             }
//             catch (error) {
//                 console.log(error)
//                 resp.status(200).json({ success: false, error: "Error in creating employer" })
//             }
//         }
//         else {
//             resp.status(200).json({ success: false, error: "Employer with this number already" })
//         }

//     }
//     else {
//          resp.status(200).json({ success: false, error: 'No a Valid email' })
//     }
// };
const employerSignUp = async (req, resp) => {
    const { fullName, companyName, designation, contactValue, role } = req.body;
    console.log("req.body", req.body);
  
    const validNumber = /^[6-9]\d{9}$/;
    const validEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    let findEmployer;
    let employerDetails;
  
    if (validNumber.test(contactValue)) {
      findEmployer = await employerSchema.findOne({ "contactInfo.primaryNumber": contactValue });
  
      if (findEmployer) {
        return resp.status(200).json({ success: false, error: "Employer with this number already exists" });
      }
  
      employerDetails = new employerSchema({
        fullName: fullName,
        companyName: companyName,
        designation: designation,
        role: role,
        contactInfo: {
          primaryNumber: contactValue,
        },
      });
    } else if (validEmail.test(contactValue)) {
      findEmployer = await employerSchema.findOne({ "contactInfo.email": contactValue });
  
      if (findEmployer) {
        return resp.status(200).json({ success: false, error: "Employer with this email already exists" });
      }
  
      employerDetails = new employerSchema({
        fullName: fullName,
        companyName: companyName,
        designation: designation,
        role: role,
        contactInfo: {
          email: contactValue,
        },
      });
    } else {
      return resp.status(200).json({ success: false, error: "Not a Valid Number or Email" });
    }
  
    try {
      await employerDetails.save();
      const token = generateToken(employerDetails?._id);
      console.log("token", token);
  
      // Create notifications for all users
      const trainers = await trainerSchema.find(); // Assuming trainerSchema is defined and contains all trainers
      const employers = await employerSchema.find(); // Assuming employerSchema is defined and contains all employers
  
      // Combine both users into one array
      const allUsers = [...trainers, ...employers];
      const notifications = allUsers.map((user) => ({
        userId: user._id,
        notifications: [
          {
            notifierId: employerDetails._id,
            notifierName: fullName,
            notifierImage: "", // Add notifier image if available
            notificationType: "New Employer Signup",
            notificationMessage: `New Employer ${fullName} has signed up!`,
            unread: true,
            createdAt: new Date(),
          },
        ],
      }));
  
      await nofitificaitonSchema.insertMany(notifications);
  
      return resp.status(201).json({ success: true, message: "Employer Profile Created", employerDetails, token });
    } catch (error) {
      console.log(error);
      return resp.status(500).json({ success: false, error: "Error in creating employer" });
    }
  };
  
const employerBasicInfoUpdate = async (req, resp) => {
  const { _id } = req.user;
  const oldEmployerDetails = await employerSchema.findById(_id);
  console.log(oldEmployerDetails, "oldEmployerDetails");
  const changes = {};

  console.log("req.file", req.files);

  try {
    let profileImgUrl;
    if (req.files === undefined) {
      console.log("profileImg is not there");
    } else if (req?.files["profileImg"]) {
      const profileImg = req.files["profileImg"][0];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `employer/profile/${_id}/${profileImg.originalname}`,
        Body: profileImg.buffer,
        ContentType: profileImg.mimetype,
      };
      const data = await s3.upload(params).promise();
      profileImgUrl = data.Location;
    }

    let profileBannerUrl;
    if (req.files === undefined) {
      console.log("profileImg is not there");
    } else if (req?.files["profileBanner"]) {
      const profileBanner = req.files["profileBanner"][0];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `employer/profile/${_id}/${profileBanner.originalname}`,
        Body: profileBanner.buffer,
        ContentType: profileBanner.mimetype,
      };
      const data = await s3.upload(params).promise();
      profileBannerUrl = data.Location;
    }

    if (req.user && req.body) {
      const updateFields = {
        "basicInfo.firstName": req.body.firstName,
        "basicInfo.lastName": req.body.lastName,
        "basicInfo.designation": req.body.designation,
        "basicInfo.company": req.body.company,
        "basicInfo.age": Number(req.body.age) || null,
        "basicInfo.location": req.body.location,
        "basicInfo.objective": req.body.objective,
        "basicInfo.aboutYou": req.body.aboutYou,
        "basicInfo.profileImg": profileImgUrl,
        "basicInfo.profileBanner": profileBannerUrl,
        "basicInfo.status": req.body.status,
        "basicInfo.profileImgStatus": true,
        "basicInfo.profileBannerStatus": true,
        fullName: `${req.body.firstName} ${req.body.lastName}`,
      };

      Object.keys(updateFields).forEach((key) => {
        if (oldEmployerDetails[key] !== updateFields[key]) {
          changes[key] = {
            old: oldEmployerDetails[key],
            new: updateFields[key],
          };
        }
      });

      const employerDetails = await employerSchema.findByIdAndUpdate(
        { _id },
        { $set: updateFields },
        { new: true }
      );

      await employerDetails.save();

      // Create and save notification
      const notification = await nofitificaitonSchema.findOneAndUpdate(
        { userId: _id },
        {
          $push: {
            notifications: {
              notifierId: _id,
              notifierName: `${req.body.firstName} ${req.body.lastName}`,
              notifierImage:
                profileImgUrl || oldEmployerDetails.basicInfo.profileImg,
              notificationType: "Profile Update",
              notificationMessage: `Your Profile has been updated.`,
              unread: true,
              createdAt: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );

      if (!notification) {
        console.log("Notification not created");
      } else {
        console.log("Notification created successfully");
      }

      resp
        .status(201)
        .json({
          success: true,
          message: "Basic Info Updated Successfully",
          employerDetails,
        });
    } else {
      const notification = await nofitificaitonSchema.findOneAndUpdate(
        { userId: _id },
        {
          $push: {
            notifications: {
              notifierId: _id,
              notifierName: "System",
              notifierImage: oldEmployerDetails.basicInfo.profileImg, // Add a default image or leave it empty
              notificationType: "Profile Update",
              notificationMessage:
                "Unauthorized access attempt to update profile.",
              unread: true,
              createdAt: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );

      if (!notification) {
        console.log("Notification not created");
      } else {
        console.log("Notification created successfully");
      }

      resp.status(200).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    const notification = await nofitificaitonSchema.findOneAndUpdate(
      { userId: _id },
      {
        $push: {
          notifications: {
            notifierId: _id,
            notifierName: "System",
            notifierImage: oldEmployerDetails.basicInfo.profileImg, // Add a default image or leave it empty
            notificationType: "Profile Update",
            notificationMessage: `Server error during profile update: ${error.message}`,
            unread: true,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    if (!notification) {
      console.log("Notification not created");
    } else {
      console.log("Notification created successfully");
    }

    resp.status(200).json({ success: false, message: "Server Error", error });
  }
};

const employerProfileImageUpdate = async (req, resp) => {
  const { _id } = req.user;
  console.log(req.file);
  try {
    let profileImgUrl;
    if (req.file) {
      const profileImg = req.file;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `employer/profile/${_id}/${profileImg.originalname}`,
        Body: profileImg.buffer,
        ContentType: profileImg.mimetype,
      };

      const data = await s3.upload(params).promise();
      profileImgUrl = data.Location;
    }
    console.log(profileImgUrl);
    if (req.user) {
      const employerDetails = await employerSchema.findByIdAndUpdate(
        { _id },
        {
          $set: {
            "basicInfo.profileImg": profileImgUrl,
            "basicInfo.profileImgStatus": true,
          },
        },
        { new: true }
      );
      await employerDetails.save();
      // console.log(employerDetails);
      resp
        .status(201)
        .json({
          success: true,
          message: "Profile Image Updated Successfully",
          employerDetails,
        });
    } else {
      resp.status(200).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
};

const employerProfileBannerUpdate = async (req, resp) => {
  const { _id } = req.user;
  try {
    let profileBannerUrl;
    if (req.file) {
      const profileBannerImg = req.file;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `employer/profile/${_id}/${profileBannerImg.originalname}`,
        Body: profileBannerImg.buffer,
        ContentType: profileBannerImg.mimetype,
      };
      const data = await s3.upload(params).promise();
      profileBannerUrl = data.Location;
    }

    if (req.user) {
      const employerDetails = await employerSchema.findByIdAndUpdate(
        { _id },
        {
          $set: {
            "basicInfo.profileBanner": profileBannerUrl,
            "basicInfo.profileBannerStatus": true,
          },
        },
        { new: true }
      );
      await employerDetails.save();
      // console.log(employerDetails);
      resp
        .status(201)
        .json({
          success: true,
          message: "Profile Banner Updated Successfully",
          employerDetails,
        });
    } else {
      resp.status(200).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
};

const employerSkillsUpdate = async (req, resp) => {
  const { _id } = req.user;
  try {
    if (req.user) {
      const employerDetails = await employerSchema.findByIdAndUpdate(
        { _id },
        {
          skills: req.body?.map((skill) => skill),
        }
      );
      await employerDetails.save();
      console.log(employerDetails);
      resp
        .status(201)
        .json({ success: true, message: "skill updated", employerDetails });
    } else {
      resp.status(200).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
};

const employerContactInfoUpdate = async (req, resp) => {
  const { primaryNumber, secondaryNumber, address, email, website, status } =
    req.body;

  const { _id } = req.user;

  try {
    if (!req.user) {
      return resp.status(401).json({ message: "User Not Found" });
    }
    const employerDetails = await employerSchema.findOneAndUpdate(
      { _id },
      {
        $set: {
          "contactInfo.primaryNumber": primaryNumber,
          "contactInfo.secondaryNumber": secondaryNumber,
          "contactInfo.address": address || "Not Available",
          "contactInfo.email": email || "Not Provided",
          "contactInfo.website": website || "Not Available",
          "contactInfo.status": true,
        },
      }
    );
    await employerDetails.save();
    // console.log(employerDetails, 'employerDetails')
    if (employerDetails) {
      resp
        .status(201)
        .json({
          success: true,
          message: "Contact Info Updated Successfully",
          employerDetails,
        });
    } else {
      resp.status(200).json({ success: false, message: "User Not Found" });
    }
  } catch (error) {
    console.log(error);
    resp.status(200).json({ message: error.toString() });
  }
};

const employerExperienceInfoUpdate = async (req, resp) => {
  const { _id } = req.user;
  const experienceDetailsArray = req.body; // Assuming req.body is an array of experience details

  console.log(experienceDetailsArray);

  try {
    if (req.user) {
      const employerDetails = await employerSchema.findByIdAndUpdate(
        _id,
        { $addToSet: { experience: { $each: experienceDetailsArray } } },
        { new: true }
      );

      await employerDetails.save();
      resp
        .status(200)
        .json({
          success: true,
          message: "Experience data has been updated",
          employerDetails,
        });
    } else {
      resp.status(401).json({ message: "You are not logged in" });
    }
  } catch (error) {
    resp.status(500).json({ message: error.toString() });
  }
};

const employerExperienceInfoDelete = async (req, resp) => {
  const { _id } = req.user;
  const experienceIdToDelete = req.params._id; // Assuming you're passing the experience ID as a URL parameter
  try {
    if (req.user) {
      const employerDetails = await employerSchema.findByIdAndUpdate(
        _id,
        { $pull: { experience: { _id: experienceIdToDelete } } },
        { new: true }
      );

      await employerDetails.save();
      resp
        .status(200)
        .json({
          success: true,
          message: "Experience data has been deleted",
          employerDetails,
        });
    } else {
      resp.status(401).json({ message: "You are not logged in" });
    }
  } catch (error) {
    resp.status(500).json({ message: error.toString() });
  }
};

const getSkills = async (req, resp) => {
  try {
    const skills = await SkillSchema.find();

    if (!skills) {
      resp.status(200).json({ success: false, message: "No Data Found" });
    } else {
      resp
        .status(201)
        .json({ success: true, message: "getting skills", skills });
    }
  } catch (error) {
    console.log(error);
  }
};

// const getemployerProfile = async (req, resp) => {
//     const employerDetails = await req.user;
//     // console.log("User details", employerDetails)
//     try {
//         if (employerDetails) {
//             resp.status(201).json({ success: true, message: 'employerProfileFected', employerDetails })
//         } else {
//             resp.status(200).json({ sucess: false, message: "You are not authorized to access this api", });
//         }
//     }
//     catch (error) {
//         resp.status(200).json({ success: false, message: 'Internal Server Error', error })
//     }
// };

const getemployerProfile = async (req, res) => {
  const employerId = req.user._id; // Assuming req.user contains the authenticated user's information

  try {
    const employerProfile = await employerSchema.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(employerId) }, // Match the authenticated employer's ID
      },
      {
        $lookup: {
          // Example of a lookup if employer has references to another collection
          from: "employers", // Replace with the actual collection name
          localField: "fieldInEmployerCollection", // Field in the employer collection
          foreignField: "_id", // Field in the referenced collection
          as: "relatedData", // Alias for the joined data
        },
      },
      {
        $project: {
          // Project only the necessary fields
          fullName: 1,
          companyName: 1,
          designation: 1,
          role: 1,
          basicInfo: 1,
          skills: 1,
          experience: 1,
          contactInfo: 1,
          connections: 1,
          likes: 1,
          notification: 1,
          relatedData: 1, // Include the joined data if applicable
        },
      },
    ]);

    if (employerProfile && employerProfile.length > 0) {
      res
        .status(201)
        .json({
          success: true,
          message: "Employer profile fetched",
          employerDetails: employerProfile[0],
        });
    } else {
      res
        .status(200)
        .json({
          success: false,
          message: "You are not authorized to access this API",
        });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

//for employer portal

const getEmployerProfileById = async (req, resp) => {
  const { id } = req.params;
  try {
    const employerDetails = await employerSchema.findOne({ _id: id });
    const employerPost = await postTrainingRequirementSchema.aggregate([
      // {  "$addFields": { "postedByIdObj": { "$toObjectId": "$postedById" } } },

      {
        $lookup: {
          from: "employers",
          localField: "postedById",
          foreignField: "_id",
          as: "employerData",
        },
      },
      {
        $set: {
          employerData: { $first: "$employerData" },
        },
      },
      {
        $set: {
          postedByName: "$employerData.fullName",
          postedByCompanyName: "$employerData.companyName",
          postedByImg: "$employerData.basicInfo.profileImg",
          postedByDesignation: "$employerData.designation",
        },
      },
      {
        $project: {
          _id: 1,
          trainingName: 1,
          description: 1,
          topics: 1,
          modeOfTraining: 1,
          typeOfTraining: 1,
          experience: 1,
          location: 1,
          participantCount: 1,
          minBudget: 1,
          maxBudget: 1,
          durationType: 1,
          durationCount: 1,
          selectedCountry: 1,
          availability: 1,
          tocFile: 1,
          startDate: 1,
          endDate: 1,
          createdAt: 1,
          urgentlyNeedTrainer: 1,
          postedById: 1,
          postedByImg: 1,
          postedByName: 1,
          postedByCompanyName: 1,
          postedByDesignation: 1,
        },
      },
      {
        $match: {
          postedById: new mongoose.Types.ObjectId(id),
          // 'postedById':{'$exists:true}
        },
      },
    ]);
    // .sort({ createdAt: -1 });
    // console.log('employerPost', employerPost);

    if (!employerDetails) {
      return resp
        .status(404)
        .json({ success: false, message: "No User Found" });
    } else {
      return resp
        .status(200)
        .json({
          success: true,
          message: "Employer Details Fetched",
          employerDetails,
          employerPost,
        });
    }
  } catch (error) {
    console.log("error", error);
    return resp
      .status(200)
      .json({ success: false, message: "Server Error", error });
  }
};

const getAppliedTrainingEmployer = async (req, resp) => {
  const { _id } = req.user;
  const postedId = _id.toString();
  console.log("api hit from employer ");
  try {
    if (req.user?.role === "employer") {
      const getAppliedTraining = await trainerAppliedTrainingSchema
        .find({
          "trainingDetails.trainingPostDetails.postedById": postedId,
        })
        .sort({ "trainingDetails.createdAt": -1 });
      if (!getAppliedTraining) {
        resp
          .status(200)
          .json({ success: false, message: "Applied Training Not Found" });
      } else {
        const filteredTraining = getAppliedTraining
          .map((training) => {
            const filteredDetails = training.trainingDetails.filter(
              (detail) => {
                return (
                  detail.appliedStatus === false &&
                  detail.applicationstatus !== "Denied" &&
                  detail.trainingPostDetails.postedById === postedId
                );
              }
            );
            return { ...training.toObject(), trainingDetails: filteredDetails };
          })
          .filter((training) => training.trainingDetails.length > 0); // Filter out entries with no matching training details
        console.log("fillter training", filteredTraining);
        resp
          .status(201)
          .json({
            success: true,
            message: "Applied Training Fected",
            getAppliedTraining: filteredTraining,
          });
      }
    } else {
      resp.status(200).json({ success: false, message: "Not An Employer" });
    }
  } catch (error) {
    // console.log(error)
    resp
      .status(200)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const getAcceptedTrainingEmployer = async (req, resp) => {
  const { _id } = req.user;
  const postedId = _id.toString();
  try {
    if (req.user?.role === "employer") {
      //fileter code
      const getAppliedTraining = await trainerAppliedTrainingSchema.aggregate([
        {
          $match: {
            "trainingDetails.trainingPostDetails.postedById": postedId,
          },
        },
        {
          $lookup: {
            from: "trainers",
            localField: "trainerId",
            foreignField: "_id",
            as: "trainerDetails",
          },
        },
        {
          $addFields: {
            trainingDetails: {
              $map: {
                input: "$trainingDetails",
                as: "training",
                in: {
                  _id: "$$training._id",
                  // trainingPostDetils: {
                  //     _id: { $toObjectId: "$$training.trainingPostDetails._id" }
                  // },
                  postId: { $toObjectId: "$$training.trainingPostDetails._id" },
                  appliedStatus: "$$training.appliedStatus",
                  applicationstatus: "$$training.applicationstatus",
                  enableTraining: "$$training.enableTraining",
                  trainingResources: "$$training.trainingResources",
                  feedBack: "$$training.feedBackDetails",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "employerpostrequirements",
            localField: "trainingDetails.postId",
            foreignField: "_id",
            as: "postDetails",
          },
        },

        {
          $addFields: {
            postDetails: {
              $filter: {
                input: "$postDetails",
                as: "post",
                cond: { $eq: ["$$post.postedById", req.user._id] },
              },
            },
          },
        },

        {
          $unwind: "$trainerDetails",
        },

        {
          $set: {
            trainerId: "$trainerDetails._id",
            trainerName: "$trainerDetails.fullName",
            trainerProfileImg: "$trainerDetails.basicInfo.profileImg",
            trainerDesignation: "$trainerDetails.basicInfo.designation",
            trainerSkills: "$trainerDetails.skills",
          },
        },
        {
          $addFields: {
            trainingDetails: {
              $filter: {
                input: {
                  $map: {
                    input: "$trainingDetails",
                    as: "training",
                    in: {
                      $cond: {
                        // if: { $eq: ["$$training.applicationstatus", "Accepted"] },
                        if: {
                          $and: [
                            {
                              $eq: ["$$training.applicationstatus", "Accepted"],
                            },
                            { $eq: ["$$training.appliedStatus", true] },
                          ],
                        },
                        then: "$$training",
                        else: null,
                      },
                    },
                  },
                },
                as: "training",
                cond: { $ne: ["$$training", null] },
              },
            },
          },
        },

        {
          $addFields: {
            trainingDetails: {
              $map: {
                input: "$trainingDetails",
                as: "training",
                in: {
                  $mergeObjects: [
                    "$$training",
                    {
                      trainingPostDetails: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$postDetails",
                              as: "trainingPostDetails",
                              cond: {
                                $and: [
                                  {
                                    $eq: [
                                      "$$trainingPostDetails.postedById",
                                      req.user._id,
                                    ],
                                  },
                                  {
                                    $eq: [
                                      "$$trainingPostDetails._id",
                                      "$$training.postId",
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            // _id: 1,
            trainerId: 1,
            trainerName: 1,
            trainerProfileImg: 1,
            trainerDesignation: 1,
            trainerSkills: 1,
            trainingDetails: 1,
            // postDetails: 1
          },
        },
      ]);

      // console.log('getAppliedTraining', getAppliedTraining[0]?.trainingDetails)

      if (!getAppliedTraining.length == 0) {
        resp
          .status(200)
          .json({
            success: true,
            message: "Applied Accepted TrainingDetails Fected",
            getAppliedTraining,
          });
      } else {
        resp
          .status(200)
          .json({
            success: false,
            message: "No Applied Accepted TrainingDetails Found",
          });
      }
    } else {
      resp.status(200).json({ success: false, message: "Invalid Request" });
    }
  } catch (error) {
    console.log(error);
    resp
      .status(200)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

const getOngoingTrainingEmployer = async (req, resp) => {
  const { _id } = req.user;
  const postedId = _id.toString();
  console.log("api from employer", _id);
  try {
    const getOngoingTraining = await trainerAppliedTrainingSchema.aggregate([
      {
        $match: {
          "trainingDetails.trainingPostDetails.postedById": postedId,
        },
      },
      {
        $lookup: {
          from: "trainers",
          localField: "trainerId",
          foreignField: "_id",
          as: "trainerDetails",
        },
      },
      {
        $addFields: {
          trainingDetails: {
            $map: {
              input: "$trainingDetails",
              as: "training",
              in: {
                _id: "$$training._id",
                trainingPostDetails: {
                  _id: { $toObjectId: "$$training.trainingPostDetails._id" },
                },
                appliedStatus: "$$training.appliedStatus",
                applicationstatus: "$$training.applicationstatus",
                trainingResources: "$$training.trainingResources",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employerpostrequirements",
          localField: "trainingDetails.trainingPostDetails._id",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      {
        $unwind: "$trainerDetails",
      },
      {
        $set: {
          trainerId: "$trainerDetails._id",
          trainerName: "$trainerDetails.fullName",
          trainerProfileImg: "$trainerDetails.basicInfo.profileImg",
          trainerDesignation: "$trainerDetails.basicInfo.designation",
        },
      },

      {
        $addFields: {
          trainingDetails: {
            $filter: {
              input: {
                $map: {
                  input: "$trainingDetails",
                  as: "training",
                  in: {
                    $cond: {
                      if: {
                        $and: [
                          { $eq: ["$$training.applicationstatus", "Accepted"] },
                          { $eq: ["$$training.appliedStatus", true] },
                          {
                            $let: {
                              vars: {
                                postDetails: {
                                  $arrayElemAt: [
                                    {
                                      $filter: {
                                        input: "$postDetails",
                                        as: "postDetails",
                                        cond: {
                                          $eq: [
                                            "$$postDetails._id",
                                            "$$training.trainingPostDetails._id",
                                          ],
                                        },
                                      },
                                    },
                                    0,
                                  ],
                                },
                              },
                              in: {
                                $and: [
                                  {
                                    $lte: [
                                      "$$postDetails.startDate",
                                      new Date().toISOString().substr(0, 10),
                                    ],
                                  },
                                  {
                                    $gte: [
                                      "$$postDetails.endDate",
                                      new Date().toISOString().substr(0, 10),
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                      then: "$$training",
                      else: null,
                    },
                  },
                },
              },
              as: "training",
              cond: { $ne: ["$$training", null] },
            },
          },
        },
      },
      {
        $addFields: {
          trainingDetails: {
            $map: {
              input: "$trainingDetails",
              as: "training",
              in: {
                $mergeObjects: [
                  "$$training",
                  {
                    trainingPostDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$postDetails",
                            as: "trainingPostDetails",
                            cond: {
                              $eq: [
                                "$$trainingPostDetails._id",
                                "$$training.trainingPostDetails._id",
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          trainerId: 1,
          trainerName: 1,
          trainerProfileImg: 1,
          trainerDesignation: 1,
          trainingDetails: 1,
        },
      },
    ]);
    resp.json({ getOngoingTraining });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
};

const getCompletedTrainingEmployer = async (req, resp) => {
  const { _id } = req.user;
  const postedId = _id.toString();
  console.log("api from employer", _id);
  try {
    // const getCompletedTraining = await trainerAppliedTrainingSchema.aggregate([
    //     {
    //         $match: {
    //             'trainingDetails.trainingPostDetails.postedById': postedId
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "trainers",
    //             localField: "trainerId",
    //             foreignField: "_id",
    //             as: "trainerDetails"
    //         }
    //     },
    //     {
    //         $addFields: {
    //             trainingDetails: {
    //                 $map: {
    //                     input: "$trainingDetails",
    //                     as: "training",
    //                     in: {
    //                         _id: "$$training._id",
    //                         trainingPostDetails: {
    //                             _id: { $toObjectId: "$$training.trainingPostDetails._id" }
    //                         },
    //                         appliedStatus: "$$training.appliedStatus",
    //                         applicationstatus: "$$training.applicationstatus",
    //                         trainingResources: "$$training.trainingResources"
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: 'employerpostrequirements',
    //             localField: 'trainingDetails.trainingPostDetails._id',
    //             foreignField: '_id',
    //             as: 'postDetails'
    //         }
    //     },
    //     {
    //         $unwind: "$trainerDetails"
    //     },
    //     {
    //         $set: {
    //             trainerId: '$trainerDetails._id',
    //             trainerName: '$trainerDetails.fullName',
    //             trainerProfileImg: '$trainerDetails.basicInfo.profileImg',
    //             trainerDesignation: '$trainerDetails.basicInfo.designation'
    //         }
    //     },

    //     {
    //         $addFields: {
    //             trainingDetails: {
    //                 $filter: {
    //                     input: {
    //                         $map: {
    //                             input: "$trainingDetails",
    //                             as: "training",
    //                             in: {
    //                                 $cond: {
    //                                     if: {
    //                                         $and: [
    //                                             { $eq: ["$$training.applicationstatus", "Accepted"] },
    //                                             { $eq: ["$$training.appliedStatus", true] },
    //                                             {
    //                                                 $let: {
    //                                                     vars: {
    //                                                         postDetails: {
    //                                                             $arrayElemAt: [
    //                                                                 {
    //                                                                     $filter: {
    //                                                                         input: "$postDetails",
    //                                                                         as: 'postDetails',
    //                                                                         cond: { $eq: ["$$postDetails._id", "$$training.trainingPostDetails._id"] }
    //                                                                     }
    //                                                                 },
    //                                                                 0
    //                                                             ]
    //                                                         }
    //                                                     },
    //                                                     in: {
    //                                                         $and: [
    //                                                             // { $gte: ["$$postDetails.startDate", new Date().toISOString().substr(0, 10)] },
    //                                                             { $lte: ["$$postDetails.endDate", new Date().toISOString().substr(0, 10)] }
    //                                                         ]
    //                                                     }
    //                                                 }
    //                                             }
    //                                         ]
    //                                     },
    //                                     then: "$$training",
    //                                     else: null
    //                                 }
    //                             }
    //                         }
    //                     },
    //                     as: "training",
    //                     cond: { $ne: ["$$training", null] }
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         $addFields: {
    //             trainingDetails: {
    //                 $map: {
    //                     input: "$trainingDetails",
    //                     as: "training",
    //                     in: {
    //                         $mergeObjects: [
    //                             "$$training",
    //                             {
    //                                 trainingPostDetails: {
    //                                     $arrayElemAt: [
    //                                         {
    //                                             $filter: {
    //                                                 input: "$postDetails",
    //                                                 as: 'trainingPostDetails',
    //                                                 cond: { $eq: ["$$trainingPostDetails._id", "$$training.trainingPostDetails._id"] }
    //                                             }
    //                                         },
    //                                         0
    //                                     ]
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         $project: {
    //             _id: 1,
    //             trainerId: 1,
    //             trainerName: 1,
    //             trainerProfileImg: 1,
    //             trainerDesignation: 1,
    //             trainingDetails: 1
    //         }
    //     }
    // ]);

    const getCompletedTraining = await trainerAppliedTrainingSchema.aggregate([
      {
        $match: {
          "trainingDetails.trainingPostDetails.postedById": postedId,
        },
      },
      {
        $lookup: {
          from: "trainers",
          localField: "trainerId",
          foreignField: "_id",
          as: "trainerDetails",
        },
      },
      {
        $unwind: "$trainerDetails",
      },
      {
        $addFields: {
          trainingDetails: {
            $filter: {
              input: "$trainingDetails",
              as: "training",
              cond: {
                $eq: ["$$training.trainingPostDetails.postedById", postedId],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "employerpostrequirements",
          localField: "trainingDetails.trainingPostDetails._id",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      {
        $addFields: {
          trainingDetails: {
            $map: {
              input: "$trainingDetails",
              as: "training",
              in: {
                $mergeObjects: [
                  "$$training",
                  {
                    trainingPostDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$postDetails",
                            as: "trainingPostDetails",
                            cond: {
                              $eq: [
                                "$$trainingPostDetails._id",
                                "$$training.trainingPostDetails._id",
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          trainingDetails: {
            $filter: {
              input: "$trainingDetails",
              as: "training",
              cond: {
                $and: [
                  { $eq: ["$$training.applicationstatus", "Accepted"] },
                  { $eq: ["$$training.appliedStatus", true] },
                  {
                    $let: {
                      vars: {
                        postDetails: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$postDetails",
                                as: "postDetails",
                                cond: {
                                  $eq: [
                                    "$$postDetails._id",
                                    "$$training.trainingPostDetails._id",
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        $and: [
                          {
                            $lte: [
                              "$$postDetails.endDate",
                              new Date().toISOString().substr(0, 10),
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          trainerId: 1,
          trainerName: 1,
          trainerProfileImg: 1,
          trainerDesignation: 1,
          trainingDetails: 1,
        },
      },
    ]);

    console.log("get", getCompletedTraining);
    resp.json({ getCompletedTraining });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfileVisibility = async (req, res) => {
  const { _id } = req.user;
  const { profileVisibility } = req.body;

  // try {
  //     const updatedProfile = await Employer.findByIdAndUpdate(
  //         _id,
  //         { $set: { 'basicInfo.visibility': profileVisibility } },
  //         { new: true }
  //     );

  //     if (!updatedProfile) {
  //         return res.status(404).json({ success: false, message: 'Employer profile not found' });
  //     }

  //     return res.status(200).json({ success: true, message: 'Profile visibility updated successfully', updatedProfile });
  // } catch (error) {
  //     console.error('Error updating profile visibility:', error);
  //     return res.status(500).json({ success: false, message: 'Internal server error' });
  // }
};
const updateContactVisibility = async (req, res) => {
  const { _id } = req.user;
  const { profileVisibility } = req.body;

  try {
    const updatedProfile = await Employer.findByIdAndUpdate(
      _id,
      { $set: { "basicInfo.visibility": profileVisibility } },
      { new: true }
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Employer profile not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Profile visibility updated successfully",
        updatedProfile,
      });
  } catch (error) {
    console.error("Error updating profile visibility:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const addBookMarkedPost = async (req, res) => {
  try {
    const { _id } = req.user;
    const postDetails = req.body; // Assuming _id is the field identifying the post
    // Check if the current user already has a bookmarked document
    let userBookmarks = await bookmarkedEmployerSchema.findOne({ userId: _id });

    if (!userBookmarks) {
      // If the current user doesn't exist, create a new document
      userBookmarks = new bookmarkedEmployerSchema({
        userId: _id,
        postDetails: [postDetails],
      });
      await userBookmarks.save();
      return res
        .status(201)
        .json({
          success: true,
          message: "Post Bookmarked Successfully",
          userBookmarks,
        });
    }

    // Check if the post is already bookmarked
    const existingPostIndex = userBookmarks.postDetails.findIndex(
      (detail) => detail._id === postDetails._id
    );

    if (existingPostIndex !== -1) {
      // If the post is already bookmarked, delete its details
      userBookmarks.postDetails.splice(existingPostIndex, 1);
      await userBookmarks.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "Post Unbookmarked Successfully",
          userBookmarks,
        });
    } else {
      // If the user exists and the post is not already bookmarked, add the new postDetails
      userBookmarks.postDetails.unshift(postDetails);
      await userBookmarks.save();
    }

    // Return a success response
    return res
      .status(201)
      .json({
        success: true,
        message: "Post Bookmarked Successfully",
        userBookmarks,
      });
  } catch (error) {
    console.error(error);
    // Return an error response if an error occurs
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getBookMarkedPostsByUserId = async (req, resp) => {
  const { _id } = req.user;

  try {
    const findBookMarkedPost = await bookmarkedEmployerSchema.findOne({
      userId: _id,
    });

    if (!findBookMarkedPost) {
      resp.status(200).json({ success: false, message: "No Data Found" });
    } else {
      resp
        .status(201)
        .json({
          success: true,
          message: "bookMarked Post fetch",
          userBookmarks: findBookMarkedPost,
        });
    }
  } catch (error) {
    console.log(error);
  }
};

const UpdatePhoneNumber = async (req, resp) => {
  const isEmail = (value) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(value);
  };

  const { contactDetails, oldContactInfo, otp } = req.body;

  console.log("req.body", req.body);
  const { _id } = req.user;

  try {
    if (req.user) {
      const valid = await compareOtp(otp, contactDetails);
      if (valid) {
        // Check if the new contact details are already used
        const userField = isEmail(contactDetails)
          ? "contactInfo.email"
          : "contactInfo.primaryNumber";

        const trainerExists = await trainerSchema.findOne({
          [userField]: contactDetails,
        });
        const employerExists = await employerSchema.findOne({
          [userField]: contactDetails,
        });

        if (trainerExists || employerExists) {
          return resp
            .status(200)
            .json({ success: false, message: "Contact Details Already Used" });
        }

        // Find the user using the old contact info
        const oldUserField = isEmail(oldContactInfo)
          ? "contactInfo.email"
          : "contactInfo.primaryNumber";
        const findUser = await employerSchema.findOne({
          [oldUserField]: oldContactInfo,
        });

        if (!findUser) {
          resp
            .status(200)
            .json({ success: false, message: "User Details Not Found" });
        } else {
          const updateData = isEmail(contactDetails)
            ? { "contactInfo.email": contactDetails }
            : { "contactInfo.primaryNumber": contactDetails };

          const employerDetails = await employerSchema.findOneAndUpdate(
            { _id },
            { $set: updateData },
            { new: true }
          );
          if (employerDetails) {
            await employerDetails.save();
            resp
              .status(201)
              .json({
                success: true,
                message: "Employer Contact Details Updated SuccessFully",
                employerDetails,
              });
          } else {
            resp
              .status(200)
              .json({
                success: false,
                message: "Error Updating Contact Details",
              });
          }
        }
      } else {
        resp.status(200).json({ success: false, message: "Invalid Otp" });
      }
    }
  } catch (error) {
    console.log(error);
    resp.status(200).json({ message: error.toString() });
  }
};

const getNotifications = async (req, resp) => {
  const { userId } = req.params;
  console.log("userId", userId);

  try {
    if (userId?.length > 0) {
      const notifications = await nofitificaitonSchema.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $unwind: "$notifications", // Deconstruct notifications array
        },
        {
          $lookup: {
            from: "trainers",
            localField: "notifications.notifierId",
            foreignField: "_id",
            as: "trainerDetails",
          },
        },
        {
          $addFields: {
            "notifications.notifierName": {
              $cond: {
                if: { $gt: [{ $size: "$trainerDetails" }, 0] },
                then: { $arrayElemAt: ["$trainerDetails.fullName", 0] },
                else: "$notifications.notifierName",
              },
            },
            "notifications.notifierImage": {
              $cond: {
                if: { $gt: [{ $size: "$trainerDetails" }, 0] },
                then: {
                  $arrayElemAt: ["$trainerDetails.basicInfo.profileImg", 0],
                },
                else: "$notifications.notifierImage",
              },
            },
          },
        },
        {
          $match: {
            "notifications.unread": true,
          },
        },
        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            notifications: { $push: "$notifications" },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            notifications: 1,
          },
        },
      ]);

      console.log("notifications", notifications);
      resp.status(200).json({ success: true, notifications });
    } else {
      console.log("user id not found");
      resp.status(200).json({ success: false, message: "User Not Found" });
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    resp.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateReadNotification = async (req, resp) => {
  const { notificationId } = req.params;
  const { userId } = req.body;
  // console.log('api hit')
  // console.log('notificaitonid', notificationId)
  // console.log('userId', userId)
  try {
    const notification = await nofitificaitonSchema.findOneAndUpdate(
      {
        userId: userId,
        "notifications._id": notificationId,
      },
      {
        $set: {
          "notifications.$.unread": false,
        },
      },
      {
        new: true,
      }
    );
    if (notification) {
      const notifications = await nofitificaitonSchema.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $unwind: "$notifications", // Deconstruct notifications array
        },
        {
          $lookup: {
            from: "trainer",
            localField: "notifications.notifierId",
            foreignField: "_id",
            as: "trainerDetails",
          },
        },
        {
          $set: {
            "notifications.notifierName": {
              $arrayElemAt: ["$trainerDetails.fullName", 0],
            },
            "notifications.notifierImage": {
              $arrayElemAt: ["$trainerDetails.basicInfo.profileImg", 0],
            },
          },
        },
        {
          $match: {
            "notifications.unread": true,
          },
        },
        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            notifications: { $push: "$notifications" },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            notifications: 1,
          },
        },
      ]);
      if (notification && notifications) {
        resp
          .status(200)
          .json({
            success: true,
            message: "Notifications Updated",
            notifications,
          });
      } else {
        resp
          .status(200)
          .json({ success: false, message: "No Notification Found" });
      }
    } else {
      resp
        .status(200)
        .json({ success: false, message: "No Notification Found" });
    }
  } catch (error) {
    // console.log(error)
    resp.status(200).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteAllNotification = async (req, resp) => {
  const { userId } = req.body;
  try {
    const notification = await nofitificaitonSchema.findOneAndReplace(
      {
        userId: userId,
      },
      {
        userId: userId,
        notifications: [],
      },
      {
        new: true,
      }
    );
    if (notification) {
      resp
        .status(200)
        .json({
          success: true,
          message: "Notification Deleted Successfully",
          notification,
        });
    } else {
      resp
        .status(200)
        .json({ success: false, message: "Notification Not Found" });
    }
  } catch (error) {
    resp.status(200).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  employerSignUp,
  getemployerProfile,
  getEmployerProfileById,
  employerProfileImageUpdate,
  employerProfileBannerUpdate,
  employerBasicInfoUpdate,
  employerSkillsUpdate,
  employerContactInfoUpdate,
  employerExperienceInfoUpdate,
  employerExperienceInfoDelete,
  getSkills,
  getAppliedTrainingEmployer,
  getAcceptedTrainingEmployer,
  getOngoingTrainingEmployer,
  getCompletedTrainingEmployer,
  updateProfileVisibility,
  addBookMarkedPost,
  getBookMarkedPostsByUserId,
  UpdatePhoneNumber,
  getNotifications,
  updateReadNotification,
  deleteAllNotification,
};

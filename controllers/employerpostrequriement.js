const postTrainingRequirementSchema = require('../models/employerpostTrainingRequirementmodel')
const postJobRequirementSchema = require('../models/employerpostJobRequirementmodel')
const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const conversationSchema = require('../models/Conversation')
const trainerSchema = require('../models/trainermodel')


const SkillSchema = require('../models/skillmodel.js')
const mongoose = require('mongoose')

const aws = require('aws-sdk');
const { newConversation } = require('./conversationctrl.js');

aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

// trainer post creationn
const postTrainingRequirement = async (req, resp) => {
    const { _id } = req.user;
    try {
        // Extracting data from request body
        const {
            trainingName, description, typeOfTraining, participantCount,
            modeOfTraining, location, minBudget, maxBudget, experience,
            durationType, durationCount, selectedCountry, availability,
            startDate, endDate, urgentlyNeedTrainer,
        } = req.body;
        let { topics } = req.body


        if (typeof topics === 'string') {
            topics = JSON.parse(topics)
        }
        console.log('req.body', req.file)
        // Check if a TOC file is provided
        let tocUrl = '';
        if (req.file) {
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `employer/tocFile/${_id}/${req.file.originalname.replace(/\s+/g, '')}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };
            const data = await s3.upload(params).promise();
            tocUrl = data.Location;
        }

        // Create a new instance of postTrainingRequirementSchema
        const trainingDetails = new postTrainingRequirementSchema({
            trainingName, description, typeOfTraining, modeOfTraining,
            experience, participantCount, location, minBudget, maxBudget,
            durationType, durationCount, selectedCountry, availability, topics,
            startDate: new Date(startDate).toISOString().split('T')[0],
            endDate: new Date(endDate).toISOString().split('T')[0],
            tocFile: {
                tocFileName: req.file?.originalname.replace(/\s+/g, '') || '',
                tocUrl
            },
            urgentlyNeedTrainer,
            postedById: _id,
        });
        if (trainingDetails) {

            // Save the new instance to the database
            await trainingDetails.save();
            console.log('trainerDetails', trainingDetails)
            // Respond with success message
            resp.status(200).json({ success: true, message: 'TrainingPostCreatedSuccessfully', trainingDetails });
        }

    } catch (err) {
        console.log(err);
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
};

// get all postrequirement details services 

const allPostTrainingRequiremnt = async () => {
    try {
        const postTrainingDetails = await postTrainingRequirementSchema.aggregate([


            {
                $lookup: {
                    from: 'employers',
                    localField: 'postedById',
                    foreignField: '_id',
                    as: 'employerDetails'
                }
            },
            {
                $lookup: {
                    from: 'trainers',
                    localField: 'comments.commentedByUser',
                    foreignField: '_id',
                    as: 'trainerDetails'
                }

            },
            {
                $unwind: "$employerDetails"
            },
            // {
            //     $unwind: "$trainerDetails"
            // },
            {
                $addFields: {
                    comments: {
                        $map: {
                            input: '$comments',
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$trainerDetails',
                                                    as: 'trainer',
                                                    cond: { $eq: ['$$trainer._id', '$$comment.commentedByUser'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    postedByName: "$employerDetails.fullName",
                    postedByImg: "$employerDetails.basicInfo.profileImg",
                    postedByDesignation: "$employerDetails.designation",
                    postedByCompanyName: "$employerDetails.companyName"
                }
            },

            {
                $project: {
                    _id: 1,
                    postedById: 1,
                    postedByName: 1,
                    postedByCompanyName: 1,
                    postedByImg: 1,
                    postedByDesignation: 1,
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
                    urgentlyNeedTrainer: 1,
                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                _id: "$$comment._id",
                                commentedByUser: '$$comment.commentedByUser',
                                commentedByProfile: '$$comment.basicInfo.profileImg',
                                commentedByName: '$$comment.fullName',
                                commentedByDesignation: '$$comment.basicInfo.designation',
                                commentText: '$$comment.commentText',
                                createdAt: '$$comment.createdAt'

                            }
                        }
                    },
                    likes: 1,
                    hide: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    bookMark: 1,
                    applicants: 1,

                }
            },
            {
                $sort: { createdAt: -1 }
            },

        ]);
        if (postTrainingDetails.length === 0) {
            return []
        }
        else {
            return postTrainingDetails;
        }
    }
    catch (error) {
        console.log(error)
    }
}

const getPostById = async (_id) => {
    try {
        const postTrainingDetails = await postTrainingRequirementSchema.aggregate([
            {
                $match: { postedById: new mongoose.Types.ObjectId(_id) }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'trainers',
                    localField: 'applicants.appliedBy',
                    foreignField: '_id',
                    as: 'trainerDetails'
                }
            },
            {
                $addFields: {
                    applicants: {
                        $map: {
                            input: '$applicants',
                            as: 'applicant',
                            in: {
                                $mergeObjects: [
                                    '$$applicant',
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$trainerDetails',
                                                    as: 'trainer',
                                                    cond: { $eq: ['$$trainer._id', '$$applicant.appliedBy'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 1,
                    postedById: 1,
                    postedByName: 1,
                    postedByCompanyName: 1,
                    postedByImg: 1,
                    postedByDesignation: 1,
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
                    urgentlyNeedTrainer: 1,
                    comments: 1,
                    likes: 1,
                    hide: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    bookMark: 1,
                    applicants: {
                        $map: {
                            input: '$applicants',
                            as: 'applicant',
                            in: {
                                appliedBy: '$$applicant.appliedBy',
                                appliedStatus: '$$applicant.appliedStatus',
                                application: '$$applicant.application',
                                applicantName: '$$applicant.fullName',
                                applicantDesignation: '$$applicant.basicInfo.designation',
                                applicantProfileImg: '$$applicant.basicInfo.profileImg'
                            }
                        }
                    }
                }
            }
        ]);

        if (postTrainingDetails.length === 0) {
            return []
        }
        else {
            return postTrainingDetails;
        }
    }
    catch (error) {
        console.log(error)
    }
}

const updatePostTrainingRequirement = async (req, resp) => {
    const { postId } = req.params
    const { _id } = req.user
    const {
        trainingName, description, typeOfTraining, participantCount,
        modeOfTraining, location, minBudget, maxBudget, experience,
        durationType, durationCount, selectedCountry, availability,
        startDate, endDate, urgentlyNeedTrainer,
    } = req.body;

    console.log('req.body', req.body)
    console.log('req.file', req.file)
    let { topics } = req.body


    if (typeof topics === 'string') {
        topics = JSON.parse(topics)
    }

    // Check if a TOC file is provided
    let tocUrl = '';
    if (req.file) {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `employer/tocFile/${_id}/${req.file.originalname.replace(/\s+/g, '')}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };
        const data = await s3.upload(params).promise();
        tocUrl = data.Location;
    }

    try {

        const findTraining = await postTrainingRequirementSchema.findById(postId)

        if (findTraining) {
            const updatePost = await postTrainingRequirementSchema.findByIdAndUpdate(postId, {
                $set: {
                    trainingName,
                    description,
                    typeOfTraining,
                    participantCount,
                    modeOfTraining,
                    location,
                    minBudget,
                    maxBudget,
                    experience,
                    durationType,
                    durationCount,
                    selectedCountry,
                    availability,
                    startDate,
                    endDate,
                    urgentlyNeedTrainer,
                    topics,
                    tocFile: {
                        tocFileName: req.file?.originalname.replace(/\s+/g, '') || '',
                        tocUrl
                    },
                }
            })
            if (updatePost) {
                const postTrainingDetails = await getPostById(_id)
                resp.status(200).json({ success: true, message: 'Post Updated', postTrainingDetails })
            }
            else {
                resp.status(200).json({ success: false, message: 'Post Not Updated' })
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'Post Not Found' })
        }
    }
    catch (error) {
        console.log(error)
    }

}

// find postRequiement and add comments
const postTrainingRequirementComments = async (req, resp) => {
    const { comment } = req.body
    const { postId } = req.params
    console.log('comment', comment)
    console.log('postId', postId)

    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ sucess: false, message: " No Post Found" })
        }
        else {
            findTrainingPost.comments.unshift(comment);
            console.log(findTrainingPost?.comments)
            await findTrainingPost.save();
            const postTrainingDetails = await allPostTrainingRequiremnt()
            if (postTrainingDetails?.length === 0) {
                resp.status(200).json({ success: false, message: 'No Training Details Found' })
            }
            else {

                resp.status(201).json({ success: true, message: 'Comment Added', postTrainingDetails })
            }
        }


    }
    catch (error) {
        console.log(error)
        resp.status(500).json({ sucess: false, message: "Server Error", error })
    }

}

//add like  on posts
const addLikeToTrainingPost = async (req, resp) => {
    const { likedBy } = req.body;
    const { postId } = req.params;

    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        // Check if likedBy already exists in the likes array
        const existingLikeIndex = findTrainingPost.likes.findIndex(like => like._id.toString() === likedBy);

        if (existingLikeIndex === -1) {
            // Add like if it doesn't exist
            findTrainingPost.likes.push({ _id: likedBy }); // Assuming likedBy is an ObjectId
            await findTrainingPost.save();

            // const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            const postTrainingDetails = await allPostTrainingRequiremnt()
            if (postTrainingDetails?.length === 0) {
                resp.status(200).json({ success: false, message: 'No Training Details Found' })
            }
            else {
                resp.status(201).json({ success: true, message: 'Like Added', postTrainingDetails });
            }
        } else {
            // Remove like if it already exists
            findTrainingPost.likes.splice(existingLikeIndex, 1);
            await findTrainingPost.save();
            // const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            const postTrainingDetails = await allPostTrainingRequiremnt()
            if (postTrainingDetails?.length === 0) {
                resp.status(200).json({ success: false, message: 'No Training Details Found' })
            }
            else {
                resp.status(201).json({ success: true, message: 'Like Removed', postTrainingDetails });
            }
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
};

const addBookMarkToTrainingPost = async (req, resp) => {
    const { bookMarkedBy } = req.body;
    const { postId } = req.params;
    console.log('req.body', req.body, postId);
    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);
        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        // Check if likedBy already exists in the likes array
        const existingLikeIndex = findTrainingPost.bookMark.findIndex(book => book._id.toString() === bookMarkedBy);

        if (existingLikeIndex === -1) {
            // Add like if it doesn't exist
            findTrainingPost.bookMark.push({ _id: bookMarkedBy }); // Assuming likedBy is an ObjectId
            await findTrainingPost.save();

            // const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            const postTrainingDetails = await allPostTrainingRequiremnt()
            if (postTrainingDetails?.length === 0) {
                resp.status(200).json({ success: false, message: 'No Training Details Found' })
            }
            else {
                resp.status(201).json({ success: true, message: 'BookMark Added', postTrainingDetails });
            }
        } else {
            // Remove like if it already exists
            findTrainingPost.bookMark.splice(existingLikeIndex, 1);
            await findTrainingPost.save();
            // const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            const postTrainingDetails = await allPostTrainingRequiremnt()
            if (postTrainingDetails?.length === 0) {
                resp.status(200).json({ success: false, message: 'No Training Details Found' })
            }
            else {
                resp.status(201).json({ success: true, message: 'BookMark Removed', postTrainingDetails });
            }
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
};

// const deletePostRequirement = async (req, resp) => {
//     const { postId } = req.params
//     const { _id } = req.user

//     try {
//         if (req.user?.role === 'employer') {
//             const deletePostRequirement = await postTrainingRequirementSchema.findOneAndDelete({ _id: postId, postedById: _id })
//             if (deletePostRequirement) {
//                 const postTrainingDetails = await getPostById(_id)
//                 if (postTrainingDetails?.length === 0) {
//                     resp.status(200).json({ success: false, message: 'No Training Details Found' })
//                 }

//                 // const postTrainingDetails = await postTrainingRequirementSchema.find({ postedById: _id });
//                 if (deletePostRequirement && postTrainingDetails) {
//                     resp.status(201).json({ success: true, message: "Deleted Successfully", postTrainingDetails })
//                 }
//             }
//             else {
//                 resp.status(200).json({ success: false, message: 'Post Not Found' })
//             }
//         }
//         else {
//             resp.status(200).json({ success: false, message: 'Access Denied' })
//         }
//     }
//     catch (error) {
//         resp.status(200).json({ success: false, message: 'Internal Server Error', error })
//     }
// }


// get the post training comments 

const deletePostRequirement = async (req, resp) => {
    const { postId } = req.params;
    const { _id } = req.user;

    try {
        if (req.user?.role === 'employer') {
            const deletePostRequirement = await postTrainingRequirementSchema.findOneAndDelete({ _id: postId, postedById: _id });

            if (!deletePostRequirement) {
                return resp.status(200).json({ success: false, message: 'Post Not Found' });
            }

            const postTrainingDetails = await getPostById(_id);

            if (!postTrainingDetails || postTrainingDetails.length === 0) {
                return resp.status(200).json({ success: false, message: 'No Training Details Found' });
            }

            return resp.status(201).json({ success: true, message: "Deleted Successfully", postTrainingDetails });
        } else {
            return resp.status(200).json({ success: false, message: 'Access Denied' });
        }
    } catch (error) {
        return resp.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};


const getTrainingRequirementComments = async (req, resp) => {
    const { postId } = req.params
    const findPostTrainingComments = await postTrainingRequirementSchema.findOne({ _id: postId })
    // console.log(findPostTrainingComments.comments)
    try {
        if (!findPostTrainingComments) {
            return resp.status(404).json({ success: false, message: "No Comments found" });
        }
        else {
            findPostTrainingComments.comments.sort((a, b) => b.createdAt - a.createdAt);
            const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            resp.status(200).json({ success: true, message: 'Getting all comments', postTrainingDetails });
        }
    }

    catch (error) {
        console.log(error)
        resp.status(500).json({ success: false, msg: "server error" });
    }

}

const deletePostTrainingComment = async (req, resp) => {
    const { postId, commentId } = req.params;

    // console.log(postId, commentId);
    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }

        const commentIndex = findTrainingPost.comments.findIndex(comment => comment.commentedByUser.toString() === commentId);

        if (commentIndex === -1) {
            return resp.status(200).json({ success: false, message: "Comment not found" });
        }

        findTrainingPost.comments.splice(commentIndex, 1);
        await findTrainingPost.save();
        // const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
        const postTrainingDetails = await allPostTrainingRequiremnt()
        if (postTrainingDetails?.length === 0) {
            resp.status(200).json({ success: false, message: 'No Training Details Found' })
        }
        else {
            resp.status(201).json({ success: true, message: 'Comment deleted', postTrainingDetails });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}


const getpostTrainingRequirement = async (req, resp) => {
    const { _id } = req.user;

    try {

        const postTrainingDetails = await postTrainingRequirementSchema.aggregate([
            {
                $match: { postedById: new mongoose.Types.ObjectId(_id) }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'employers',
                    localField: 'postedById',
                    foreignField: '_id',
                    as: 'employerDetails'
                }
            },
            {
                $unwind: '$employerDetails'
            },
            {
                $lookup: {
                    from: 'trainers',
                    localField: 'applicants.appliedBy',
                    foreignField: '_id',
                    as: 'trainerDetails'
                }
            },
            {
                $lookup: {
                    from: 'trainers',
                    localField: 'comments.commentedByUser',
                    foreignField: '_id',
                    as: 'commentedByUsers'
                }

            },

            {
                $addFields: {
                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$commentedByUsers",
                                                    as: "commentedUser",
                                                    cond: { $eq: ["$$commentedUser._id", "$$comment.commentedByUser"] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }

            },

            {
                $addFields: {
                    applicants: {
                        $map: {
                            input: '$applicants',
                            as: 'applicant',
                            in: {
                                $mergeObjects: [
                                    '$$applicant',
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$trainerDetails',
                                                    as: 'trainer',
                                                    cond: { $eq: ['$$trainer._id', '$$applicant.appliedBy'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    postedByName: "$employerDetails.fullName",
                    postedByImg: "$employerDetails.basicInfo.profileImg",
                    postedByDesignation: "$employerDetails.designation",
                    postedByCompanyName: "$employerDetails.companyName"
                }
            },

            {
                $project: {
                    _id: 1,
                    postedById: 1,
                    postedByName: 1,
                    postedByCompanyName: 1,
                    postedByImg: 1,
                    postedByDesignation: 1,
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
                    urgentlyNeedTrainer: 1,
                    // comments: 1,
                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                _id: "$$comment._id",
                                commentedByUser: '$$comment.commentedByUser',
                                commentedByProfile: '$$comment.basicInfo.profileImg',
                                commentedByName: '$$comment.fullName',
                                commentedByDesignation: '$$comment.basicInfo.designation',
                                commentText: '$$comment.commentText',
                                createdAt: '$$comment.createdAt'
                            }
                        }
                    },
                    likes: 1,
                    hide: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    bookMark: 1,
                    applicants: {
                        $map: {
                            input: '$applicants',
                            as: 'applicant',
                            in: {
                                appliedBy: '$$applicant.appliedBy',
                                appliedStatus: '$$applicant.appliedStatus',
                                application: '$$applicant.application',
                                applicantName: '$$applicant.fullName',
                                applicantDesignation: '$$applicant.basicInfo.designation',
                                applicantProfileImg: '$$applicant.basicInfo.profileImg'
                            }
                        }
                    },
                }
            }
        ]);

        // console.log('postTrainingDetails', postTrainingDetails)
        if (postTrainingDetails.length === 0) {
            resp.status(200).json({ success: false, message: "No Training Requirements Found" });
        } else {
            resp.status(200).json({ success: true, message: 'Post Training Requirements Fetched', postTrainingDetails });
        }
    } catch (error) {
        console.error(error);
        resp.status(500).json({ success: false, message: 'Server Error', error });
    }
};

const updateApplicationStatus = async (req, resp) => {
    const { trainerId, trainingId, status } = req.body
    const { _id } = req.user
    const postedId = _id.toString()
    // console.log('req.body', typeof (new mongoose.Types.ObjectId(trainerId)))
    console.log('req.body',req.body)
    console.log('traiingId',typeof(trainingId))
    try {
        //updatind the application status in the posted details 
        const findApplication = await postTrainingRequirementSchema.findOne(
            {
                // postedById: new mongoose.Types.ObjectId(_id),
                _id: new mongoose.Types.ObjectId(trainingId),
                // 'applicants.appliedBy': new mongoose.Types.ObjectId(trainerId)
            },
        )
        console.log('findApplication', findApplication)
        const updatedApplicationStatus = await postTrainingRequirementSchema.findOneAndUpdate(
            {
                postedById: new mongoose.Types.ObjectId(_id),
                _id: new mongoose.Types.ObjectId(trainingId),
                'applicants.appliedBy': new mongoose.Types.ObjectId(trainerId)
            },
            status === 'Denied'
                ? {
                    $pull: {
                        applicants: { appliedBy: new mongoose.Types.ObjectId(trainerId) }
                    }
                }
                : {
                    $set: {
                        'applicants.$[elem].appliedStatus': true,
                        'applicants.$[elem].application': 'Accepted'
                    }
                },
            status === 'Denied'
                ? { new: true }
                : {
                    arrayFilters: [{ 'elem.appliedBy': new mongoose.Types.ObjectId(trainerId) }],
                    new: true
                }
        );

        console.log('updatedApplicationStatus', updatedApplicationStatus)


        if (!updatedApplicationStatus) {
            resp.status(200).json({ success: false, message: 'Error While Updating The Application' })
        }
        else {
            //updating the application status in the trainer application schema and model
            const updatedApplicationTrainer = await trainerAppliedTrainingSchema.findOneAndUpdate(
                {
                    trainerId: trainerId,
                    'trainingDetails.trainingPostDetails._id': trainingId,// Filter by both trainerId and trainingDetailsId
                    'trainingDetails.trainingPostDetails.postedById': postedId
                },
                {
                    $set: {
                        'trainingDetails.$.appliedStatus': status === 'Denied' ? false : true,
                        'trainingDetails.$.applicationstatus': status === 'Denied' ? 'Denied' : 'Accepted'
                    }
                },
                { new: true }
            );

            if (!updatedApplicationTrainer) {
                resp.status(200).json({ success: false, message: 'Error While Updating The Application In Trainer End' })
            }
            else {
                await updatedApplicationStatus.save()
                await updatedApplicationTrainer.save()
                const findConversation = await conversationSchema.findOne({
                    members: { $elemMatch: { _id } },
                    // requestStatus: "pending" // Filter by request status being "accepted"
                })
                // console.log('conversationExisting', findConversation)
                if (!findConversation) {
                    const receiver = await trainerSchema.findById(trainerId)
                    // Create a new conversation
                    const newconversation = new conversationSchema({
                        members: [
                            { _id: _id, fullName: req.user?.fullName, basicInfo: req.user.basicInfo, role: req.user.role },
                            { _id: receiver?._id, fullName: receiver?.fullName, basicInfo: receiver.basicInfo, role: receiver.role }
                        ],
                        requestStatus: 'accepted'
                    });
                    // console.log('newConversation', newConversation)
                    if (newconversation) {
                        await newconversation.save()
                    }
                }
                else {
                    const findconversation = await conversationSchema.findOneAndUpdate(
                        {
                            members: { $elemMatch: { _id: trainerId, _id } },
                            requestStatus: "pending",
                        },
                        {
                            $set: {
                                'requestStatus': 'accepted',
                            }
                        },
                        { new: true },
                    )
                    if (findconversation) {
                        await findconversation.save()
                    }
                }
                const postTrainingDetails = await postTrainingRequirementSchema.aggregate([
                    {
                        $match: { postedById: new mongoose.Types.ObjectId(_id) }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $lookup: {
                            from: 'trainers',
                            localField: 'applicants.appliedBy',
                            foreignField: '_id',
                            as: 'trainerDetails'
                        }
                    },
                    {
                        $addFields: {
                            applicants: {
                                $map: {
                                    input: '$applicants',
                                    as: 'applicant',
                                    in: {
                                        $mergeObjects: [
                                            '$$applicant',
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$trainerDetails',
                                                            as: 'trainer',
                                                            cond: { $eq: ['$$trainer._id', '$$applicant.appliedBy'] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },

                    {
                        $project: {
                            _id: 1,
                            postedById: 1,
                            postedByName: 1,
                            postedByCompanyName: 1,
                            postedByImg: 1,
                            postedByDesignation: 1,
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
                            urgentlyNeedTrainer: 1,
                            comments: 1,
                            likes: 1,
                            hide: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            bookMark: 1,
                            applicants: {
                                $map: {
                                    input: '$applicants',
                                    as: 'applicant',
                                    in: {
                                        appliedBy: '$$applicant.appliedBy',
                                        appliedStatus: '$$applicant.appliedStatus',
                                        application: '$$applicant.application',
                                        applicantName: '$$applicant.fullName',
                                        applicantDesignation: '$$applicant.basicInfo.designation',
                                        applicantProfileImg: '$$applicant.basicInfo.profileImg'
                                    }
                                }
                            }
                        }
                    }
                ]);
                resp.status(200).json({ success: true, message: 'application Updated', postTrainingDetails })
            }

        }
    }
    catch (error) {
        console.log('error', error)
    }



}

const enableTrainingStatus = async (req, resp) => {
    const { appliedById, trainingId } = req.body;
    const { _id } = req.user;
    const postedId = _id.toString();
    // console.log('traininDetails', trainingId)
    // console.log('req.body', new mongoose.Types.ObjectId(trainingId))
    try {
        // Remove all other users from applicants array except the one specified by appliedById
        const removeOtherUsers = await postTrainingRequirementSchema.findOneAndUpdate(
            {
                // postedById: new mongoose.Types.ObjectId(postedId),
                _id: new mongoose.Types.ObjectId(trainingId)
            },
            {
                removefeed:true
            },
            {
                $pull: {
                    applicants: { _id: { $ne: new mongoose.Types.ObjectId(appliedById) } }
                }
            },
            {
                new: true
            }
        );
        if (removeOtherUsers) {
            // Enable training status for the specified trainer and trainingDetailsId
            const enableTraining = await trainerAppliedTrainingSchema.findOneAndUpdate(
                {
                    trainerId: new mongoose.Types.ObjectId(appliedById),
                    'trainingDetails.trainingPostDetails._id': trainingId, // Filter by both trainerId and trainingDetailsId
                    'trainingDetails.trainingPostDetails.postedById': postedId
                },
                {
                    $set: {
                        'trainingDetails.$.enableTraining': true
                    }
                },
                {
                    new: true
                }
            );
            console.log('enableTraining', enableTraining)
            if (enableTraining) {
                const postTrainingDetails = await postTrainingRequirementSchema.aggregate([
                    {
                        $match: { postedById: new mongoose.Types.ObjectId(_id) }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $lookup: {
                            from: 'trainers',
                            localField: 'applicants.appliedBy',
                            foreignField: '_id',
                            as: 'trainerDetails'
                        }
                    },
                    {
                        $addFields: {
                            applicants: {
                                $map: {
                                    input: '$applicants',
                                    as: 'applicant',
                                    in: {
                                        $mergeObjects: [
                                            '$$applicant',
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$trainerDetails',
                                                            as: 'trainer',
                                                            cond: { $eq: ['$$trainer._id', '$$applicant.appliedBy'] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },

                    {
                        $project: {
                            _id: 1,
                            postedById: 1,
                            postedByName: 1,
                            postedByCompanyName: 1,
                            postedByImg: 1,
                            postedByDesignation: 1,
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
                            urgentlyNeedTrainer: 1,
                            comments: 1,
                            likes: 1,
                            hide: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            bookMark: 1,
                            applicants: {
                                $map: {
                                    input: '$applicants',
                                    as: 'applicant',
                                    in: {
                                        appliedBy: '$$applicant.appliedBy',
                                        appliedStatus: '$$applicant.appliedStatus',
                                        application: '$$applicant.application',
                                        applicantName: '$$applicant.fullName',
                                        applicantDesignation: '$$applicant.basicInfo.designation',
                                        applicantProfileImg: '$$applicant.basicInfo.profileImg'
                                    }
                                }
                            }
                        }
                    }
                ]);
                resp.status(200).json({ message: 'Training Status Updated Successfully', postTrainingDetails });
            } else {
                resp.status(404).json({ message: 'Training details not found' });
            }
        } else {
            resp.status(404).json({ message: 'No other users found to remove' });
        }
    } catch (error) {
        console.error('Error:', error);
        resp.status(500).json({ message: 'Internal server error' });
    }
};





const postJobRequirement = async (req, resp) => {
    console.log(req.body,"req.body")
    try {
        // Extracting data from request body
        const { jobTitle,postedById, description2, description3, salary, benifit, location2, experience2, qualificationRef, topics2 } = req.body;
        // console.log(req.body)
        const PostJobData = new postJobRequirementSchema({
            jobTitle,
            postedById,
            description2,
            description3,
            postType: 'job',
            modeOfJob: 'Offline',
            salary,
            benifit,
            location2,
            experience2,
            location2,
            qualificationRef,
            topics2
        });

        // Saving the new JobPost instance to the database
        await PostJobData.save()
        // console.log(PostJobData)
        // Responding with a success message
        resp.status(200).json({ sucess: true, message: 'PostJobDataSaved' })
    }
    catch (err) {
        console.log(err)
        resp.status(500).json({ sucess: false, message: 'server error ' })
    }
}

const getpostJobRequirement = async (req, resp) => {
    try {
        const postJobRequiementDetails = await postJobRequirementSchema.find()
        if (postJobRequiementDetails) {
            resp.status(201).json({ success: true, message: 'postJobDetails fetched', postJobRequiementDetails })
        }
        else {
            resp.status(200).json({ success: false, message: 'postJobDetails Data Not Found' })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}

const getAllPostTrainingRequirement = async (req, resp) => {
    try {
        const postTrainingDetails = await postTrainingRequirementSchema.aggregate([
            {
                $lookup: {
                    from: 'employers',
                    localField: 'postedById',
                    foreignField: '_id',
                    as: 'employerDetails'
                }
            },
            {
                $lookup: {
                    from: 'trainers',
                    localField: 'comments.commentedByUser',
                    foreignField: '_id',
                    as: 'trainerDetails'
                }

            },
            {
                $unwind: "$employerDetails"
            },
            {
                $addFields: {
                    comments: {
                        $map: {
                            input: '$comments',
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$trainerDetails',
                                                    as: 'trainer',
                                                    cond: { $eq: ['$$trainer._id', '$$comment.commentedByUser'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    postedByName: "$employerDetails.fullName",
                    postedByImg: "$employerDetails.basicInfo.profileImg",
                    postedByDesignation: "$employerDetails.designation",
                    postedByCompanyName: "$employerDetails.companyName"
                }
            },

            {
                $project: {
                    _id: 1,
                    postedById: 1,
                    postedByName: 1,
                    postedByCompanyName: 1,
                    postedByImg: 1,
                    postedByDesignation: 1,
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
                    urgentlyNeedTrainer: 1,
                    // comments: 1,
                    applicants: 1,
                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                _id: "$$comment._id",
                                commentedByUser: '$$comment.commentedByUser',
                                commentedByProfile: '$$comment.basicInfo.profileImg',
                                commentedByName: '$$comment.fullName',
                                commentedByCompany: '$$comment.basicInfo.designation',
                                commentText: '$$comment.commentText',
                                createdAt: '$$comment.createdAt'
                            }
                        }
                    },
                    likes: 1,
                    hide: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    bookMark: 1,

                }
            },
            {
                $sort: { createdAt: -1 }
            },
        ]);

        if (postTrainingDetails.length === 0) {
            resp.status(200).json({ success: false, message: "No Training Requirements Found" });
        } else {
            resp.status(200).json({ success: true, message: 'Post Training Requirements Fetched', postTrainingDetails });
        }
    } catch (error) {
        console.error("Error fetching post training requirements:", error);
        resp.status(500).json({ success: false, message: 'Server Error', error });
    }
};



const hidePost = async (req, resp) => {
    const { hideBy } = req.body;
    const { postId } = req.params;
    console.log(req.body)

    try {
        const findTrainingPost = await postTrainingRequirementSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }
        else {
            findTrainingPost.hide.push({ _id: hideBy });
            await findTrainingPost.save();

            // const postTrainingDetails = await postTrainingRequirementSchema.find().sort({ createdAt: -1 });
            const postTrainingDetails = await allPostTrainingRequiremnt()
            if (postTrainingDetails?.length === 0) {
                resp.status(200).json({ success: false, message: 'No Training Details Found' })
            } else {
                resp.status(201).json({ success: true, message: 'post Hided', postTrainingDetails });
            }
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}

const employerPostSearchHistory = async (req, res) => {
    try {
        const employerpost = await postTrainingRequirementSchema.find();
        res.json(employerpost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const postTrainingSkills = async (req, resp) => {
    try {
        const skills = await SkillSchema.find()
        if (skills.length > 0) {

            const postTrainingSkill = skills?.map(({ name }) => {
                return {
                    value: name,
                    label: name
                }
            })
            if (postTrainingSkill) {
                resp.status(201).json({ success: true, message: 'Skills Feteched', postTrainingSkill })
            }

        }
        else {
            resp.status(200).json({ success: false, message: 'No Data Found' })
        }

    } catch (error) {
        console.log(error)

    }
}



module.exports = {
    postTrainingRequirement,
    getpostTrainingRequirement,
    updateApplicationStatus,
    postJobRequirement,
    getpostJobRequirement,
    postTrainingRequirementComments,
    getTrainingRequirementComments,
    addLikeToTrainingPost,
    deletePostRequirement,
    getAllPostTrainingRequirement,
    deletePostTrainingComment,
    hidePost,
    employerPostSearchHistory,
    updatePostTrainingRequirement,
    postTrainingSkills,
    enableTrainingStatus,
    addBookMarkToTrainingPost
}

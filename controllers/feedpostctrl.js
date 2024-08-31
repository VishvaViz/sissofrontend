const aws = require('aws-sdk')
require('dotenv').config()
const feedSchema = require('../models/feedmodel')
const { default: mongoose } = require('mongoose');


aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,
})
const s3 = new aws.S3();


const createPost = async (req, resp) => {
    const { _id } = req.user
    console.log('req.body', req.body)
    console.log('req.file', req.file)
    try {
        let postImgUrl;
        let postedImg = {
            fileName: '',
            postImg: ''
        }
        if (req.file === undefined) {
            postedImg.fileName = 'noImage'
        }
        if (req.file) {
            const postImg = req.file
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `feedpost/${_id}/${postImg.originalname}`,
                Body: postImg.buffer,
                ContentType: postImg.mimetype
            };
            const data = await s3.upload(params).promise();
            // console.log("Image uploaded successfully at ", data.Location);
            postImgUrl = data.Location;
            postedImg.fileName = postImg.originalname
            postedImg.postImg = postImgUrl

        }
        if (req.body) {
            const createPost = new feedSchema({
                postedById: _id,
                postForAllSissoMember: req.body.postForAllSissoMember || false,
                onlyPostMyConnenctions: req.body.onlyPostMyConnenctions || false,
                postedDescrition: req.body.postedDescrition,
                postedImg: postedImg
            })
            if (createPost) {
                await createPost.save()
                resp.status(201).json({ success: true, message: "Your Post has been created Successfully!", createPost });
            }
        }
        else {
            resp.status(200).json({ success: false, message: "No Data Provided" })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: "Internal Server Error", error });
    }
}

const getfeeddetails = async () => {
    try {
        const feedBackDetails = await feedSchema.aggregate([
            {
                $lookup: {
                    from: "trainers",
                    localField: "postedById",
                    foreignField: "_id",
                    as: "trainerDetails"
                }
            },
            {
                $unwind: {
                    path: "$trainerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "postedById",
                    foreignField: "_id",
                    as: "employerDetails"
                }
            },
            {
                $unwind: {
                    path: "$employerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "postedById",
                    foreignField: "_id",
                    as: "studentDetails"
                }
            },
            {
                $unwind: {
                    path: "$studentDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    postedBy: {
                        $mergeObjects: [
                            { $ifNull: ["$trainerDetails", {}] },
                            { $ifNull: ["$employerDetails", {}] },
                            { $ifNull: ["$studentDetails", {}] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    postedByName: '$postedBy.fullName',
                    postedByImg: '$postedBy.basicInfo.profileImg',
                    postedByDesignation: '$postedBy.designation',
                    postedByRole: '$postedBy.role',
                    postedById: 1,
                    postedImg: 1,
                    postedDescrition: 1,
                    onlyPostMyConnenctions: 1,
                    postForAllSissoMember: 1,
                    postedDate: 1,
                    hide: 1,
                    likes: 1,
                    updatedAt: 1,
                    bookMark: 1,
                }
            }
        ])
        if (feedBackDetails?.length > 0) {
            return feedBackDetails
        }
        else {
            return feedBackDetails
        }

    }
    catch (error) {
        console.log(error)
    }

}


const getAllFeedDetails = async (req, resp) => {
    console.log('api hit')
    try {
        const feedPostDetails = await feedSchema.aggregate([
            {
                $lookup: {
                    from: "trainers",
                    localField: "postedById",
                    foreignField: "_id",
                    as: "trainerDetails"
                }
            },
            {
                $unwind: {
                    path: "$trainerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "postedById",
                    foreignField: "_id",
                    as: "employerDetails"
                }
            },
            {
                $unwind: {
                    path: "$employerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "postedById",
                    foreignField: "_id",
                    as: "studentDetails"
                }
            },
            {
                $unwind: {
                    path: "$studentDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    postedBy: {
                        $mergeObjects: [
                            { $ifNull: ["$trainerDetails", {}] },
                            { $ifNull: ["$employerDetails", {}] },
                            { $ifNull: ["$studentDetails", {}] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    postedByName: '$postedBy.fullName',
                    postedByImg: '$postedBy.basicInfo.profileImg',
                    postedByDesignation: '$postedBy.designation',
                    postedByRole: '$postedBy.role',
                    postedById: 1,
                    postedImg: 1,
                    postedDescrition: 1,
                    onlyPostMyConnenctions: 1,
                    postForAllSissoMember: 1,
                    postedDate: 1,
                    hide: 1,
                    likes: 1,
                    updatedAt: 1,
                    bookMark: 1,
                }
            }
        ])
        resp.status(200).json({ success: true, message: "Feed Details Retrieved Successfully!", feedPostDetails })

    }
    catch (error) {
        console.log(error)
    }
}

const addLikeFeedPost = async () => {
    const { likedBy } = req.body
    const { postId } = req.params;


    try {
        const findFeedPost = await feedSchema.findById(postId);
        if (!findFeedPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }
        const existingLikeIndex = feedSchema.likes.findIndex(like => like._id.toString() === likedBy);

        if (existingLikeIndex === -1) {
            // Add like if it doesn't exist
            feedSchema.likes.push({ _id: likedBy }); // Assuming likedBy is an ObjectId
            await feedSchema.save();
            // const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })
            const feedPostDetails = await getfeeddetails()
            // console.log('trainer',trainercreatePost)
            resp.status(201).json({ success: true, message: 'Like Added', feedPostDetails });
        } else {
            // Remove like if it already exists
            findFeedPost.likes.splice(existingLikeIndex, 1);
            await findFeedPost.save();
            // const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 })
            const feedPostDetails = await getfeeddetails()

            resp.status(201).json({ success: true, message: 'Like Removed', feedPostDetails });
        }
    }
    catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }

}

const hidepost = async (req, resp) => {
    const { hideBy } = req.body;
    const { postId } = req.params;

    try {
        const findFeedPost = await feedSchema.findById(postId);

        if (!findFeedPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }
        else {
            findFeedPost.hide.push({ _id: hideBy });
            await findFeedPost.save();
            const feedPostDetails = await getfeeddetails()
            resp.status(201).json({ success: true, message: 'post Hided', feedPostDetails });
        }

    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
}

const deletefeedPostById = async (req, resp) => {
    const { userId } = req.body
    console.log('userId',userId)
    const { postId } = req.params

    try {
        const findFeedPost = await feedSchema.findByIdAndDelete({ _id: postId });

        if (!findFeedPost) {
            return resp.status(200).json({ success: false, message: "No Post Found" });
        }
        else {
            const feedPostDetails = await getfeeddetails()
            resp.status(201).json({ success: true, message: 'Post Deleted', feedPostDetails });
        }

    } catch (error) {
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
};


















module.exports = {
    createPost,
    getAllFeedDetails,
    addLikeFeedPost,
    hidepost,
    deletefeedPostById
}

const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const trainerSchema = require('../models/trainermodel.js')
const trainerFeedBackSchema = require('../models/trainerfeedback&reviewmodel.js')
const mongoose = require('mongoose');
const postTrainingRequirementSchema = require('../models/employerpostTrainingRequirementmodel')
const { notifications } = require('../utils/services.js')


const getAllAppliedTraining = async (req, resp) => {

    const { _id } = req.user
    const postedId = _id.toString()
    try {
        const allAppliedTrainingDetails = await trainerAppliedTrainingSchema.find(
            {
                'trainingDetails.trainingPostDetails.postedById': postedId,
            }
        ).sort({ createdAt: -1 });

        // Filter out trainingDetails with appliedStatus set to false and applicationstatus not equal to 'Denied'
        const filteredTrainingDetails = allAppliedTrainingDetails.map((document) => {
            const filteredDetails = document?.trainingDetails?.filter((detail) => {
                return detail.appliedStatus === false && detail.applicationstatus !== 'Denied';
            });

            return {
                ...document.toObject(),
                trainingDetails: filteredDetails
            };
        });

        // Filter out documents with empty trainingDetails array
        const finalFilteredTrainingDetails = filteredTrainingDetails.filter((document) => {
            return document.trainingDetails.length > 0;
        });

        // If there are no filtered training details, return an error response
        if (finalFilteredTrainingDetails.length === 0) {
            return resp.status(200).json({ success: false, message: 'No Applied Training' });
        } else {
            // Return the filtered applied training details
            return resp.status(201).json({ success: true, message: 'Filtered Applied Training Fetched', appliedTrainingDetails: finalFilteredTrainingDetails });
        }
    } catch (error) {
        console.error('Error while fetching applied training details:', error);
        return resp.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};


const updateAppliedStatus = async (req, resp) => {
    const { trainerId, trainingDetailsId, status } = req.body; // Assuming you're passing trainerId and trainingDetailsId in the request body
    const { _id } = req.user
    const postedId = _id.toString()
    try {
        const updatedTraining = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: trainerId,
                'trainingDetails._id': trainingDetailsId,// Filter by both trainerId and trainingDetailsId
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

        await updatedTraining.save()
        
        // console.log(updatedTraining);

        if (updatedTraining) {
            const getAppliedTraining = await trainerAppliedTrainingSchema.find(
                {
                    'trainingDetails.trainingPostDetails.postedById': postedId,
                }
            )
            if (updatedTraining && getAppliedTraining) {
                const notifierDetails = updatedTraining.trainingDetails.find(detail => detail.trainingPostDetails.postedById === postedId);
                let notification = {
                    notifierId: postedId,
                    notifierName: notifierDetails.trainingPostDetails.postedByName,
                    notifierImage: notifierDetails.trainingPostDetails.postedByImg,
                    notificationMessage: 'Training Request Accepted'
                };

                await notifications(trainerId, notification)

                const filteredTraining = getAppliedTraining.map(training => {
                    const filteredDetails = training.trainingDetails.filter(detail => {
                        return detail.appliedStatus === false &&
                            detail.applicationstatus !== 'Denied' &&
                            detail.trainingPostDetails.postedById === postedId;
                    });
                    return { ...training.toObject(), trainingDetails: filteredDetails };
                }).filter(training => training.trainingDetails.length > 0); // Filter out entries with no matching training details
                resp.status(201).json({ success: true, message: 'Applied status updated successfully', getAppliedTraining: filteredTraining });
            }

        } else {
            resp.status(200).json({ success: false, message: 'Trainer training details not found' });
        }
    } catch (error) {
        console.error('Error updating applied status:', error);
        resp.status(200).json({ success: false, message: 'Internal server error' });
    }
};

const enableTrainingStatus = async (req, resp) => {
    const { trainerId, trainingDetailsId, status } = req.body
    const { _id } = req.user
    const postedId = _id.toString()
    try {
        const enableTraining = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: trainerId,
                'trainingDetails._id': trainingDetailsId,// Filter by both trainerId and trainingDetailsId
                'trainingDetails.trainingPostDetails.postedById': postedId
            },
            {
                $set:{
                    'trainingDetails.$enableTraining':true
                }
            },
            {
                new: true
            }
        )
        if(enableTraining){
            await enableTraining.save()
        }


    }
    catch (error) {

    }

}


const updateFeedBackTrainer = async (trainerId, feedBackDetails) => {
    const findTrainer = await trainerFeedBackSchema.findOne({ trainerId: trainerId });
    if (findTrainer) {
        findTrainer.feedBackDetails?.unshift(feedBackDetails);
        await findTrainer.save();
    }
    else {
        const feedBack = new trainerFeedBackSchema({
            trainerId: trainerId,
            feedBackDetails: [feedBackDetails]
        })
        await feedBack.save()
    }
    return findTrainer
}
const addFeedback = async (req, res) => {
    const { _id } = req.user;
    const postedId = _id.toString()
    const { trainingDetailsId } = req.params;
    const { rating, feedBack } = req.body;

    const feedBackDetails = {
        reviewedById: _id,
        reviewedByName: req.user.fullName,
        reviewedByDesignation: req.user.basicInfo.company,
        reviewedByImg: req.user.basicInfo.profileImg,
        rating: rating,
        feedBack: feedBack,
        trainingDetails: trainingDetailsId
    };

    try {
        const trainingPostData = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: req.body?.trainerId,
                'trainingDetails._id': trainingDetailsId
            },
            {
                $set: {
                    'trainingDetails.$.feedBackDetails': feedBackDetails
                }
            },
            { new: true }
        );

        if (!trainingPostData) {
            return res.status(404).json({ success: false, message: "No such training post found." });
        }
        else {
            const addFeedback = await updateFeedBackTrainer(req.body?.trainerId, feedBackDetails)
            console.log('addFeedback', addFeedback);
            const getAppliedTraining = await trainerAppliedTrainingSchema.aggregate([
                {
                    $match: {
                        'trainingDetails.trainingPostDetails.postedById': postedId
                    }
                },
                {
                    $lookup: {
                        from: "trainers",
                        localField: "trainerId",
                        foreignField: "_id",
                        as: "trainerDetails"
                    }
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
                                        _id: { $toObjectId: "$$training.trainingPostDetails._id" }
                                    },
                                    appliedStatus: "$$training.appliedStatus",
                                    applicationstatus: "$$training.applicationstatus",
                                    trainingResources: "$$training.trainingResources",
                                    feedBack: '$$training.feedBackDetails'
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'employerpostrequirements',
                        localField: 'trainingDetails.trainingPostDetails._id',
                        foreignField: '_id',
                        as: 'postDetails'
                    }
                },
                {
                    $unwind: "$trainerDetails"
                },
                {
                    $set: {
                        trainerId: '$trainerDetails._id',
                        trainerName: '$trainerDetails.fullName',
                        trainerProfileImg: '$trainerDetails.basicInfo.profileImg',
                        trainerDesignation: '$trainerDetails.basicInfo.designation',
                        trainerSkills: '$trainerDetails.skills'
                    }
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
                                                        { $eq: ["$$training.applicationstatus", "Accepted"] },
                                                        { $eq: ["$$training.appliedStatus", true] }
                                                    ]
                                                },
                                                then: "$$training",
                                                else: null
                                            }
                                        }
                                    }
                                },
                                as: "training",
                                cond: { $ne: ["$$training", null] }
                            }
                        }
                    }
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
                                                            as: 'trainingPostDetails',
                                                            cond: { $eq: ["$$trainingPostDetails._id", "$$training.trainingPostDetails._id"] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
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
                        trainerId: 1,
                        trainerName: 1,
                        trainerProfileImg: 1,
                        trainerDesignation: 1,
                        trainerSkills: 1,
                        trainingDetails: 1
                    }
                }
            ]);
            console.log('getApplied', getAppliedTraining)
            if (getAppliedTraining) {
                return res.status(201).json({ success: true, message: 'Feedback added', getAppliedTraining });
            }
            else {
                return res.status(201).json({ success: false, message: 'Feedback not added' })
            }
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


// by user id 
const getFeedBack = async () => {
    const { trainerId } = req.params

    const findFeedBack = await trainerAppliedTrainingSchema.findById(trainerId, 'trainingDetails')


}



module.exports = {
    getAllAppliedTraining, updateAppliedStatus, addFeedback
}
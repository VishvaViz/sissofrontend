const { Decimal128 } = require('mongodb')
const mongoose = require('mongoose')

const trainerAppliedTraining = new mongoose.Schema({
    trainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'trainer'
    },

    trainingDetails: [
        {
            trainingPostDetails: {
                type: Object,
            },
            trainingResources: [
                {
                    fileName: {
                        type: String,
                    },
                    fileData: {
                        type: String
                    },
                    fileOriginalName: {
                        type: String
                    }

                }
            ],
            feedBackDetails: {
                
                reviewedById: {
                    type: String,
                },
                rating: {
                    type: mongoose.Types.Decimal128
                },
                feedBack: {
                    type: String
                }
            },
            appliedStatus: {
                type: Boolean,
                default: false
            },
            applicationstatus: {
                type: String,
                default: 'Pending'
            },
            enableTraining:{
                type:Boolean,
                default:false
            }

        }
    ],


},
    { timestamps: true }
)

module.exports = mongoose.model("trainerappliedtraining", trainerAppliedTraining)
const mongoose = require('mongoose')

const employerTrainingRequest = new mongoose.Schema({
    employerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'employer'
    },
    trainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'trainer'
    },
    trainerProfileImg: {
        type: String,
    },
    trainerName: {
        type: String
    },
    trainerDesignation: {
        type: String
    },
    trainingDetails: [
        {
            trainingPostDetails: {
                type: Object
            },
            appliedStatus: {
                type: Boolean,
                default: false
            },
            applicationstatus: {
                type: String,
                default: 'Requested'
            }
        }
    ]


},
{ timestamps: true });


module.exports = mongoose.model('employertrainingrequest', employerTrainingRequest) 

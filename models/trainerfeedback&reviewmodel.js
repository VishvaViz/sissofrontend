const mongoose = require('mongoose')

const trainerFeedBackSchema = new mongoose.Schema({
    trainerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'trainers'
    },
    feedBackDetails: [
        {
            trainingDetails:{
                type:mongoose.Types.ObjectId,
                ref: 'employerpostrequirements'
            },
            reviewedById: {
                type: mongoose.Types.ObjectId,
                ref:'employers',
                required: true
            },
            rating: {
                type: Number
            },
            feedBack: {
                type: String
            }
        }
    ],



})

// Create index on trainerId field
trainerFeedBackSchema.index({ trainerId: 1 });
module.exports = mongoose.model("TrainerFeedback", trainerFeedBackSchema)


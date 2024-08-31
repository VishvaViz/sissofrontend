const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: [true, 'Job ID is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    phoneNo: {
        type: String,
        required: [true, 'Phone number is required'],
    },
    resume: {
        type: String,
        required: [true, 'Resume is required'],
    },
    coverLetter: {
        type: String,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    } 

}, { timestamps: true }
)

module.exports= mongoose.model('jobSchema', jobSchema)

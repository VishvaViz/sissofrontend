const mongoose = require('mongoose');

const employerPostJobRequriementSchema = new mongoose.Schema({

    postedByName:{
        type:String, 
    },
    postedById:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employerSchema'
    },
    postType:{
        type:String
    },
    modeOfJob:{
        type:String
    },
    postedByComapnyName:{
        type:String
    },
    postedByProfileImg:{
        type: Buffer
    },
    postedByDesignation:{
        type:String
    },
    jobTitle: {
        type: String,
    },
    description2: {
        type: String,
    },
    topics2: [{
        type: String,
    }],
    description3: {
        type: String,
    },
    salary: {
        type: String,
    },
    benifit: {
        type: String,
    },
    location2: {
        type: String
    },
    experience2: {
        type: String
    },
    qualificationRef: {
        type: String,
    },

},
 { timestamps: true }
);

module.exports = mongoose.model('postJobRequirementSchema', employerPostJobRequriementSchema);

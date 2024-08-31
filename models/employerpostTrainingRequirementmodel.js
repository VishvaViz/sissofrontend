const mongoose = require('mongoose');

const employerPostRequriementSchema = new mongoose.Schema({
    postedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employer'
    },
    trainingName: {
        type: String,
    },
    description: {
        type: String,
    },
    topics: [

    ],
    modeOfTraining: {
        type: String,
    },
    typeOfTraining: {
        type: String,
    },
    experience: {
        type: String,
    },
    location: {
        type: String
    },
    participantCount: {
        type: String
    },
    minBudget: {
        type: String,
    },
    maxBudget: {
        type: String
    },
    durationType: {
        type: String
    },
    durationCount: {
        type: String
    },
    selectedCountry: {
        type: String
    },
    availability: {
        type: String
    },
    tocFile: {
        tocFileName: String,
        tocUrl: String
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
    urgentlyNeedTrainer: {
        type: String
    },
    // Comments feature
    comments: [
        {
            commentedByUser: {
                type: mongoose.Schema.Types.ObjectId,
            },
            commentText: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }

        },

    ],
    likes: [
        {
            likedBy: {
                type: String,
            }
        }
    ],
    bookMark: [
        {
            bookMarkedBy: {
                type: String,
            },
        },
    ],
    hide: [
        {
            hideBy: {
                type: String,
            }
        }
    ],
    applicants: [
        {
            appliedBy: {
                type: mongoose.Schema.Types.ObjectId
            },
            appliedStatus: {
                type: Boolean,
                default: false
            },
            application: {
                type: String,
                default: 'Pending'
            }
        }
    ],
    removefeed:{
        type:Boolean,
        default:false
    }

},
    { timestamps: true }
);

employerPostRequriementSchema.indexes({ postedById: 1 });

module.exports = mongoose.model('EmployerPostRequirement', employerPostRequriementSchema);
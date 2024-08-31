const mongoose = require('mongoose')

const employerCreatePost = new mongoose.Schema({
    postedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainers'
    },
    postForAllSissoMember: {
        type: Boolean,
        default: false
    },
    onlyPostMyConnenctions: {
        type: Boolean,
        default: false
    },
    postedImg: {
        fileName: {
            type: String
        },
        postImg: {
            type: String
        }
    },
    postedDescrition: {
        type: String
    },
    comments: [
        {
            commentedByUser: {
                type: mongoose.Schema.Types.ObjectId
            },
            commentText: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    likes: [
        {
            likedBy: {
                type: String,
            }
        }
    ],
    hide: [
        {
            hideBy: {
                type: String,
            }
        }
    ]

}, { timestamps: true }

)

module.exports = mongoose.model("employerCreatePost", employerCreatePost)
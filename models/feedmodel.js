const mongoose = require('mongoose')


const feedSchema = new mongoose.Schema(
    {
        postedById: {
            type: mongoose.Schema.Types.ObjectId,
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
        postedDate:{
            type: Date,
            default: Date.now

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
        ]
    }
)
module.exports= mongoose.model('Feed', feedSchema)
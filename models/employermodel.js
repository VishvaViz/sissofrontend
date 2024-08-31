const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
        },
        companyName: {
            type: String
        },
        designation: {
            type: String
        },
        role: {
            type: String
        },
        basicInfo: {

            profileImg: {
                type: String,
            },
            profileBanner: {
                type: String
            },
            firstName: {
                type: String
            },
            lastName: {
                type: String
            },
            designation: {
                type: String
            },
            company: {
                type: String
            },
            age: {
                type: Number
            },
            location: {
                type: String
            },
            objective: {
                type: String
            },
            aboutYou: {
                type: String
            },
            status: {
                type: Boolean,
                default: false
            },
            profileImgStatus:{
                type: Boolean,
                default: false
            },
            profileBannerStatus:{
                type: Boolean,
                default: false
            },
            visbility: {
                noOne: {
                    type: Boolean,
                    default: false
                },
                yourFriends: {
                    type: Boolean,
                    default: false
                },
                allSissoMembers: {
                    type: Boolean,
                    default: false
                }
            }
        },
        skills: [
            {
                name: {
                    type: String,
                    required: true
                },
                image: {
                    type: String,
                }
            }
        ],
        experience: [
            {
                companyName: {
                    type: String
                },
                designation2: {
                    type: String
                },
                startDate: {
                    type: String,
                    required: true
                },
                endDate: {
                    type: String
                },
                roleDescription: {
                    type: String
                },
                status: {
                    type: Boolean,
                    default: false
                }
            },

        ],

        contactInfo: {

            primaryNumber: {
                type: String,
                unique: true,
                sparse: true // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            secondaryNumber: {
                type: String,
                unique: true,
                sparse: true  // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            address: {
                type: String
            },
            email: {
                type: String,
                unique: true,
                lowercase: true,
                sparse: true  // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            website: {
                type: String
            },
            status:{
                type:Boolean,
                default:false
            },
            visbility: {
                noOne: {
                    type: Boolean,
                    default: false
                },
                yourFriends: {
                    type: Boolean,
                    default: false
                },
                allSissoMembers: {
                    type: Boolean,
                    default: false
                }
            }
        },
        connections: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'
                }
            }
        ],
        likes: [
            {
                postId: {
                    type: mongoose.Schema.Types.ObjectId, ref: ''
                }
            }
        ],
        notification: {

            messages: {
                type: Boolean,
                default: false
            },
            updateProfile: {
                type: Boolean,
                default: false
            },
            newsAndreports: {
                type: Boolean,
                default: false
            },
            proposals: {
                type: Boolean,
                default: false
            }

        }

    },
    {
        timestamps: true
    }
)
employerSchema.indexes({ 'contactInfo.primaryNumber': 1 });

module.exports = mongoose.model("Employers", employerSchema)
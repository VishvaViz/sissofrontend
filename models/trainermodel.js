const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
    {

        fullName: {
            type: String,
        },
        experience: {
            type: Number,
        },
        skills: [
            {
                name: {
                    type: String,
                    required: true
                },
                image: {
                    type: String,
                },
                range: {
                    type: String
                }
            }
        ],
        role: {
            type: String,  //trainer or employer
        },


        basicInfo: {

            profileImg: {
                type: String
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

        certificateDetails: [
            {
                certificateHead: {
                    type: String
                },
                institution: {
                    type: String
                },
                certificationDescription: {
                    type: String
                },
                certificateUrl: {
                    type: String,
                },
                status: {
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
                sparse: true // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            address: {
                type: String
            },
            email: {
                type: String,
                unique: true,
                sparse: true  // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            website: {
                type: String
            },
            availableDate: {
                type: Date,
                //default value is the current date and time  
                default: new Date()
            },
            status: {
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
        experiences: {
            expertIn: {
                type: String
            },
            experience: {
                type: Number
            },
            sinceInTheFiled: {
                type: Number
            },
            recentCompany: {
                type: String
            },
            trainingSession:{
                type:Number,
                default:0
            },
            status: {
                type: Boolean,
                default: false
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
        rating: [
            {
                trainingName: String,
                value: Number,  // from 1 to 5
                feedBack:String,
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
    { timestamps: true }

)


trainerSchema.indexes({ 'contactInfo.primaryNumber': 1 });

module.exports = mongoose.model("Trainers", trainerSchema)
const mongoose = require ('mongoose');

const studentSchema = new mongoose.Schema(
    {
        fullName:{
            type:String
        },
        degree:{
            type:String
        },
        skills:[
            {
                name:{
                    type:String,
                    required:true
                },
                image:{
                    type:String
                },
                range:{
                    type:String
                }
            }
        ],
        role:{
            type:String        //trainer,employer or student
        },
        basicInfo:{
            profileImg:{
                type:String
            },
            profileBanner:{
                type:String
            },
            firstName:{
                type:String
            },
            lastname:{
                type:String
            },
            occupation:{
                type:String
            },
            location:{
                type:String
            },
            aboutYou:{
                type:String
            },
            age:{
                type:Number
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


        education:[
            {
                nameOfSchoolOrCollege:{
                    type:String
                },
                degree:{
                    type:String
                },
                majorSubject:{
                    type:String
                },
                startDate:{
                    type:String,
                    required:true
                },
                endDate:{
                    type:String
                },
                status:{
                    type: Boolean,
                    required: false
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
                },
            }
        ],

        contactInfo:{
            primaryNumber:{
                type:String,
                unique:true,
                sparse: true // Allows multiple documents that have the same value for the indexed field if one of the values is null.  
            },
            secondaryNumber:{
                type:String,
                unique:true,
                sparse: true // Allows multiple documents that have the same value for the indexed field if one of the values is null.
            },
            address:{
                type:String
            },
            email:{
                type:String,
                unique:true,
                sparse:true
            },
            portfolio:{
                type:String
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
        }
})

studentSchema.indexes({ 'contactInfo.primaryNumber': 1 });

module.exports = mongoose.model("Students", studentSchema)

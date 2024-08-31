const mongoose = require('mongoose')


const ConversationSchema = mongoose.Schema(
    {
        members: {
            type: Array,  // array of user id's that are in the conversation
            // required: true
        },
        lastMessage: {
            type: {
                sender: String,
                receiver: String,
                text: String,
                createdAt: String,
                isRead: {
                    type: Boolean,
                    default: false,
                },
            },
            default: null,
        },
        requestStatus:{
            type:String,   // "pending", "accepted" or "rejected"
            default: 'pending',
        },

    },

    {
        timestamps: true
    }

)

// Adding an index to the members field
ConversationSchema.index({ members: 1 });
ConversationSchema.index({ 'lastMessage.createdAt': -1 })

module.exports = mongoose.model("Conversation", ConversationSchema)

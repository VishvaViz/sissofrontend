const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true
        },

        sender: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        },


    },
    {
        timestamps: true
    }
)
// Example: Adding indexes to conversationId and sender
MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({text:1}); // Sort by date descending
module.exports = mongoose.model("Message", MessageSchema)
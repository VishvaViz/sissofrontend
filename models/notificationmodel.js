const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    notifications: [
        {
            notifierId: {
                type: mongoose.Schema.Types.ObjectId,
            },
            notifierName: {
                type: String,
            },
            notifierImage: {
                type: String,
            },
            notificationType: {
                type: String,
            },
            notificationMessage: {
                type: String,
            },
            unread: {
                type: Boolean,
                default: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        
        }
    ]
},

)

module.exports = mongoose.model('Notification', notificationSchema);
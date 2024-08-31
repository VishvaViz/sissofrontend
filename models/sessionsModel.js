const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    deviceInfo: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);

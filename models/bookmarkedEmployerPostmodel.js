const mongoose = require('mongoose')

const bookMarkedEmployerPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookMark',
        required: true
    },
    postDetails: [
        {
            type: Object
        }
    ]
});


module.exports = mongoose.model('bookMarkedEmployerPost', bookMarkedEmployerPostSchema)
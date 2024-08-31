const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    fullName: {
        type: String
    },
    email: {
        type: String
    },
    primaryNumber: {
        type: Number
    },
    role: {
        type: String
    }
    
})

module.exports = mongoose.model('Admin', AdminSchema)
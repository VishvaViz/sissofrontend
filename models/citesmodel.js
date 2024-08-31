const mongoose = require('mongoose')

const citesSchema = new mongoose.Schema({

    City: {
        type: String
    },
    State: {
        type: String
    },
    District: {
        type: String
    }

})

module.exports = mongoose.model("Cites", citesSchema)
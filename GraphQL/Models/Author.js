const mongoose = require('mongoose')

// bookCount not included as it is calculated by the server itself thus not stored in the database. 
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, born: {
        type: Number,
    }
})

module.exports =  mongoose.model('Author', schema)

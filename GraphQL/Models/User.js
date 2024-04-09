const mongoose = require('mongoose')

const schema = mongoose.Schema({
    username: {
        type: String,
        minlength: 5,
        required: true
    }, 
    passwordHash: {
        type: String,
        required: true
    },
    favouriteGenre: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', schema)

module.exports = User
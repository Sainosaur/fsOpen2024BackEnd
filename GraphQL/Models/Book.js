const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Author',
        required: true
    }, published: {
        type: Number,
        required: true
    }, genres: [
        { type: String }
    ]
})

schema.plugin(uniqueValidator)

module.exports = new mongoose.model('Book', schema)
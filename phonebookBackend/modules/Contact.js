const mongoose = require('mongoose')
const URL = process.env.MONGO_URI

mongoose.set('strictQuery', false)
mongoose.connect(URL)

const contactSchema = new mongoose.Schema({
    name : String,
    number : Number
})

const Contact = mongoose.model('Contact', contactSchema)

const returnData = (request, response) => {
    Contact.find({}).then(contacts => {
        response.json(contacts)
    })
}

module.exports = {
    returnData
}
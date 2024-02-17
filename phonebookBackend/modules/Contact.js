const mongoose = require('mongoose')
const URL = process.env.MONGO_URI

mongoose.set('strictQuery', false)
mongoose.connect(URL)

const contactSchema = new mongoose.Schema({
    name : String,
    number : Number
})

const Contact = mongoose.model('Contact', contactSchema)

const returnData = (request, response, id ) => {
    if (!id) {
    Contact.find({}).then(contacts => {
        response.json(contacts)
    })
    } else if (id) {
        Contact.findById(id).then(contacts =>
            response.json(contacts))
    }
}

const saveNumber = (request, response) => {
    const person = new Contact({
            name : request.body.name,
            number : request.body.number
    })
    if (person.name && person.number) {
        person.save()
        response.json(person)
    } else {
        response.status(500).end()
    }

}

module.exports = {
    returnData,
    saveNumber
}
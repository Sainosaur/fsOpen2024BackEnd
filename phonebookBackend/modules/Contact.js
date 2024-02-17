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
    }).catch(error => {
        console.log(error)
        response.status(500).end()
    })
    } else if (id) {
        Contact.findById(id).then(contacts =>
            response.json(contacts))
            .catch(error => {
                console.log(error)
                response.status(400).end()
            })
    }
}

const saveContact = (request, response) => {
    const person = new Contact({
            name : request.body.name,
            number : request.body.number
    })
    if (person.name && person.number) {
        person.save().then(result => response.json(result)).catch(error => {
            console.log(error)
            response.status(404).end()
        })
    } else {
        response.status(500).end()
    }

}
const deleteContact = (response, id) => {
    Contact.findByIdAndDelete(id).then(contact => {
        if (contact) {
        response.json(contact)
        } else {
            response.status(404).end()
        }
    })
}
module.exports = {
    returnData,
    saveContact,
    deleteContact
}
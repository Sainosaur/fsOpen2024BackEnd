const mongoose = require('mongoose')
const URL = process.env.MONGO_URI

mongoose.set('strictQuery', false)
mongoose.connect(URL)

const contactSchema = new mongoose.Schema({
    name : String,
    number : Number
})

const Contact = mongoose.model('Contact', contactSchema)

const returnData = (request, response, id, next ) => {
    if (!id) {
    Contact.find({}).then(contacts => {
        response.json(contacts)
    }).catch(error => {
        next(error)
    })
    } else if (id) {
        Contact.findById(id).then(contacts => {
            if (contacts) {
            response.json(contacts)}
            else {
                throw new Error("NotFound")
            }
    })
            .catch(error => {
                next(error)
            })
    }
}

const saveContact = (request, response, next) => {
    const person = new Contact({
            name : request.body.name,
            number : request.body.number
    })
    if (person.name && person.number) {
        person.save().then(result => response.json(result)).catch(error => {
            next(error)
        })
    } else {
        throw new Error("BadRequest")
    }

}
const deleteContact = (request, response, id, next) => {
    Contact.findByIdAndDelete(id).then(contact => {
        if (contact) {
        response.json(contact)
        } else {
            throw new Error("Not found")
        }
    }).catch(error => {
        next(error)
    })
}

const ammendContact = (person, response, id) => {
    Contact.findByIdAndUpdate(id, person, { new : true }).then(contact => {
        response.json(contact)
    }).catch(error => {
        throw new Error("BadRequest")
    })
}

module.exports = {
    returnData,
    saveContact,
    deleteContact,
    ammendContact
}
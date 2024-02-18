const mongoose = require('mongoose')
const URL = process.env.MONGO_URI

mongoose.set('strictQuery', false)
mongoose.connect(URL)

const contactSchema = new mongoose.Schema({
    name : {
        type : String,
        minLength : 3,
        required: true
    },
    number : {
        type: Number,
        required: true
    }
})

const Contact = mongoose.model('Contact', contactSchema)

const returnData = (response, id, next ) => {
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
    person.save().then(result => response.json(result)).catch(error => {
        next(error)
    })

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
const dbInfo = (response) => {
    Contact.find({}).then(data => {
        response.send(`<p> Phonebook has info for ${data.length} people </p>
        <p> ${new Date() }`)
    })
} 

module.exports = {
    returnData,
    saveContact,
    deleteContact,
    ammendContact,
    dbInfo
}
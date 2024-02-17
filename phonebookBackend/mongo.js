const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log("Password required")
    process.exit()
} else {
    const URL = `mongodb+srv://saiadi4002:${process.argv[2]}@phonebook2024.jgynltl.mongodb.net/?retryWrites=true&w=majority`
    mongoose.set('strictQuery', false)
    // connects to supplied URL
    mongoose.connect(URL)
    // Creates a schema for storing contacts
    const contactSchema = new mongoose.Schema({
        name: String,
        number: Number
    })
    // Creates model based on contactSchema if not existing already
    // Also simulataneously creates collection called contacts
    const Contact = mongoose.model('Contact', contactSchema)
        if (process.argv.length > 3) {
        // Creating new contact objects with parameters from terminal arguments
        const contact = new Contact({
            name : process.argv[3],
            number : process.argv[4]
        })
        // Saving contact to database and closing connection
        contact.save().then(res => {
            console.log(`Added ${contact.name} number ${contact.number} to phonebook `)
            mongoose.connection.close()
        })
    } else {
        // Returns contact list if no parameters are supplied and closes connection
        Contact.find({}).then(res => {
            console.log("phonebook:")
            res.forEach(contact => console.log(`${contact.name}  ${contact.number}`))
            mongoose.connection.close()
        })
    }
}
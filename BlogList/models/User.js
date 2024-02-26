const mongoose = require('mongoose')
const config = require('../utils/config')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required : true,
        unique : true
    },
    name : String,
    passwordHash : {
        type: String,
        required : true
    }
})

userSchema.set('toJSON', {
    transform: (document, retObj) => {
        retObj.id = String(retObj._id)
        delete retObj._id
        delete retObj.__v
        delete retObj.passwordHash
    }

})

const User = mongoose.model('User', userSchema)
const url = `mongodb+srv://saiadi4002:${config.MONGO_URI}@bloglistdb.42c9rhk.mongodb.net/?retryWrites=true&w=majority&appName=BlogListDB`
mongoose.connect(url)

module.exports = User
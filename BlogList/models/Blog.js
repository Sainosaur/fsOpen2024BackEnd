const mongoose = require('mongoose')
const config = require('../utils/config')
const blogSchema = new mongoose.Schema({
    title: {
      type : String,
    required : true
    },
    author: {
      type : String,
      required : true
    },
    url: {
      type : String,
      required : true
    },
    user : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: Number
  })
  blogSchema.set('toJSON', {
    transform: (document, retObj) => {
      retObj.id = String(retObj._id)
      delete retObj._id
      delete retObj.__v
    }
  })
  
  const Blog = mongoose.model('Blog', blogSchema)
  
  const mongoUrl = `mongodb+srv://saiadi4002:${config.MONGO_URI}@bloglistdb.42c9rhk.mongodb.net/?retryWrites=true&w=majority&appName=BlogListDB`
  mongoose.connect(mongoUrl)

  module.exports = Blog
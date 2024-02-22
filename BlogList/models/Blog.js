const mongoose = require('mongoose')
const config = require('../utils/config')
const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })
  
  const Blog = mongoose.model('Blog', blogSchema)
  
  const mongoUrl = `mongodb+srv://saiadi4002:${config.MONGO_URI}@bloglistdb.42c9rhk.mongodb.net/?retryWrites=true&w=majority&appName=BlogListDB`
  mongoose.connect(mongoUrl)

  module.exports = Blog
const express = require('express')
const BlogRouter = require('express').Router()
const cors = require("cors")
// loads in Blog object from models to allow for sending data to Mongo Atlas
const Blog = require('../models/blog')

BlogRouter.use(cors())
BlogRouter.use(express.json())

BlogRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

BlogRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)
  console.log(request.body)
  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = BlogRouter
const express = require('express')
const BlogRouter = require('express').Router()
const cors = require("cors")
// loads in Blog object from models to allow for sending data to Mongo Atlas
const Blog = require('../models/blog')

BlogRouter.use(cors())
BlogRouter.use(express.json())

BlogRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

BlogRouter.post('/', async (request, response) => {
  if (!request.body.likes) {
    request.body.likes = 0
  }
  const blog = new Blog(request.body)
  const req = await blog.save()
  try {
      response.status(201).json(req)
    } catch {
      response.status(400).json('Bad Request')
    }
})

module.exports = BlogRouter
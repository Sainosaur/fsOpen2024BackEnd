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
  try {
      const req = await blog.save()
      response.status(201).json(req)
    } catch {
      response.status(400).json('Bad Request')
    }
})

BlogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  try {
    const res = await Blog.findByIdAndDelete(id)
    if (res) {
      response.status(204).json(res)
    } else {
      response.status(400).json("Blog does not exist")
    }
  } catch {
    response.status(500).json("Internal Server Error")
  }
})

BlogRouter.put('/:id', async (request, response, next) => {
  const updatedBlog = {
    title : request.body.title,
    author : request.body.author,
    url : request.body.url,
    likes : request.body.likes
  }
  try {
    // remember requests must be made in try, errors will be forwarded to catch this is different compared to ES6!!
    const res = await Blog.findByIdAndUpdate(String(request.params.id), updatedBlog, {new : true})
      response.status(200).json(res);
  } catch {
    response.status(400).json("Bad Request")
  }
})


module.exports = BlogRouter
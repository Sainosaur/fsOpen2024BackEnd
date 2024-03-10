const express = require('express')
const BlogRouter = require('express').Router()
const cors = require("cors")
// loads in Blog object from models to allow for sending data to Mongo Atlas
const Blog = require('../models/blog')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const morgan = require('morgan')

const returnToken = (request) => {
  const token = request.get('authorization')
  if (token) {
    token.replace('Bearer ', '')
  }
  return token
}

BlogRouter.use(cors())
BlogRouter.use(express.json())
BlogRouter.use(morgan((tokens, req, res) => {
  let retArr = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]
  if (tokens.method(req, res) == 'POST') {
    retArr.push(JSON.stringify(req.body))
  }
  return retArr.join(' ')
}))

BlogRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

BlogRouter.post('/', async (request, response) => {
  if (!request.body.likes) {
    request.body.likes = 0
  }
  const blog = new Blog(request.body)
  try {
      const usr = jwt.verify(returnToken(request), config.SECRET)
      blog.user = usr.id
      const req = await blog.save()
      const user = await User.findByIdAndUpdate(usr.id)
      user.blogs = user.blogs.concat(String(req._id))
      await user.save()

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
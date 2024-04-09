const express = require('express')
const testingRouter = express.Router()
const cors = require("cors")
const Blog = require('../models/blog')
const User = require('../models/User')
const morgan = require('morgan')


testingRouter.use(cors())
testingRouter.use(express.json())
testingRouter.use(morgan((tokens, req, res) => {
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

testingRouter.post('/reset', async (req, res) => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    res.status(200).json('Databases reset, server ready for testing!')
}) 


module.exports = testingRouter
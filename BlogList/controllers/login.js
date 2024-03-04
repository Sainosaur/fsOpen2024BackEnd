// Router used to handle logging in

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const loginRouter = express.Router()
const config = require('../utils/config')
const User = require('../models/User')
const cors = require('cors')
const morgan = require('morgan')

loginRouter.use(cors())
loginRouter.use(express.json())
loginRouter.use(morgan((tokens, req, res) => {
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

loginRouter.post('/', async (req, res) => {
    console.log(req.body)
    const {username, password} = req.body
    const usr = await User.findOne({username})
    try {
        passwordValid = await bcrypt.compare(password, usr.passwordHash)
        if (passwordValid && usr) {
            const userObj = {
                username : usr.username,
                name : usr.name,
                id : usr._id
            }
            userObj.token = jwt.sign(userObj, config.SECRET)
            res.status(200).json(userObj)
        } else {
            res.status(404).json("User or password invalid")
        }
    } catch {
        res.status(404).json("Invalid User or Password")
    }
})

module.exports = loginRouter
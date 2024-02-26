// Router used to handle logging in

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const loginRouter = express.Router()
const config = require('../utils/config')
const User = require('../models/User')

loginRouter.use(express.json())

loginRouter.post('/', async (req, res) => {
    const {username, password} = req.body
    const usr = await User.findOne({username})
    const passwordValid = await bcrypt.compare(password, usr.passwordHash)
    if (passwordValid && usr) {
        const userObj = {
            username : usr.username,
            id : usr._id
        }
        const token = jwt.sign(userObj, config.SECRET)
        res.status(200).json(token)
    } else {
        res.status(404).json("User or password invalid")
    }
})

module.exports = loginRouter
const bcrypt = require('bcrypt')
const express = require('express')
const userRouter = express.Router()
const User = require('../models/User')
const cors = require('cors')
userRouter.use(express.json())
userRouter.use(cors())

userRouter.get('/', async (req, res) => {
    const data = await User.find({})
    res.status(200).json(data)
})

userRouter.post('/', async (req, res) => {
    // Generating a hash based on the password supplied with 'salt' 10
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    // Processing input data to create object needed
    const data = {
        username : req.body.username,
        name : req.body.name,
        passwordHash
    }
    // creating new User object with processed attributes
    const user = new User(data)
    // Attempting to save the data to the database before reporting either 201 or 500 based on the result
    try {
        const response = await user.save()
        res.status(201).json(response)
    } catch {
        res.status(500).json("Internal server error")
    }
})

module.exports = userRouter
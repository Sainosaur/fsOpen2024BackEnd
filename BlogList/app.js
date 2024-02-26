const express = require('express')
// creates app instance to run based on router
const app = express()
// imports blogrouter module into index
const BlogRouter = require('./controllers/blogs')
const UserRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
// App loads in middleware with location /api/blogs specified such that all paths are initated as needed
app.use('/api/blogs', BlogRouter)
app.use('/api/users', UserRouter)
app.use('/api/login', loginRouter)
module.exports = app
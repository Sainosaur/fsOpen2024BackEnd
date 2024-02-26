const express = require('express')
// creates app instance to run based on router
const app = express()
// imports blogrouter module into index
const BlogRouter = require('./controllers/blogs')
// App loads in middleware with location /api/blogs specified such that all paths are initated as needed
app.use('/api/blogs', BlogRouter)

module.exports = app
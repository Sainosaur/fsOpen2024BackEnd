require('dotenv').config()
const Contact = require('./modules/Contact')
const express = require('express');
const morgan = require('morgan')
const cors = require('cors')
const port = process.env.PORT || 3000
const path = require('path')
const fs = require('fs')
const app = express()
const errorHandler = (error, request, response, next) => {
  if (error.name == 'CastError' || error.message == 'BadRequest') {
    response.status(400).send("Bad Request")
  } else if (error.message == "NotFound") {
    response.status(404).send("Not Found")
  } else {
    next(error)
  }
}
app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
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

app.get('/', (request, response, next) => {
  response.sendFile(path.join(__dirname, '/dist/index.html'))
})

app.get('/dist/assets/:file', (request, response, next) => {
  const filepath = path.join(__dirname, '/dist/assets',request.params.file)
  if (fs.existsSync(filepath)) {
    response.sendFile(filepath)
  } else {
    throw new Error('NotFound')
  }
})

app.get("/api/persons", (request, response, next) => {
   Contact.returnData(request, response)
})

app.get("/api/persons/:id", (request, response, next) => {
  Contact.returnData(request, response, String(request.params.id), next)
})

app.get("/info", (request, response, next) => {
  response.send(`<p> Phonebook has info for ${contacts.length} people </p>
  <p> ${new Date() }`)
})

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.deleteContact(request, response, String(request.params.id), next)
})

app.post("/api/persons", (request, response, next) => {
  Contact.saveContact(request, response)
}) 
app.use(errorHandler)

app.listen(port,'127.0.0.1')
require('dotenv').config()
const Contact = require('./modules/Contact')
const express = require('express');
const morgan = require('morgan')
const cors = require('cors')
const port = process.env.PORT || 3000
const path = require('path')
const fs = require('fs')

let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const app = express()
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

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/dist/index.html'))
})

app.get('/dist/assets/:file', (request, response) => {
  const filepath = path.join(__dirname, '/dist/assets',request.params.file)
  if (fs.existsSync(filepath)) {
    response.sendFile(filepath)
  } else {
    request.status(404).end()
  }
})

app.get("/api/persons", (request, response) => {
   Contact.returnData(request, response)
})

app.get("/api/persons/:id", (request, response) => {
  Contact.returnData(request, response, String(request.params.id))
})

app.get("/info", (request, response) => {
  response.send(`<p> Phonebook has info for ${contacts.length} people </p>
  <p> ${new Date() }`)
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const contact = contacts.find(contact => contact.id === id)
  if (contact) {
    contacts = contacts.filter(contact1 => contact1 != contact)
    response.json(contact)
  } else {
    response.status(404).end()
  }
})

app.post("/api/persons", (request, response) => {
  Contact.saveNumber(request, response)
}) 

app.listen(port,'127.0.0.1')
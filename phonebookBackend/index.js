const express = require('express');

const contacts = [
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

app.get("/api/persons", (request, response) => {
   response.json(contacts)
})


app.get("/info", (request, response) => {
  response.send(`<p> Phonebook has info for ${contacts.length} people </p>
  <p> ${new Date() }`)
})


app.listen(3001)
console.log('Server running on port 3001')
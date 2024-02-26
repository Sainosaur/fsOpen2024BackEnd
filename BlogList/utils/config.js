require('dotenv').config(path='../.env')
// Uses the .env file to extract the port and mongo password before exporting them
const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
const SECRET = process.env.SECRET

module.exports = {
    PORT,
    MONGO_URI,
    SECRET
}
const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('@apollo/server')
const User = require('./src/Models/User')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const typeDefs = require('./src/typedefs')
const resolvers = require('./src/resolvers')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { GraphQLError } = require('graphql')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@apollo/server/express4')
const PORT = 4000


const start = async () => {
  const server = new ApolloServer({
    schema: makeExecutableSchema({typeDefs, resolvers}),
    plugins: [
      ApolloServerPluginDrainHttpServer
    ]
  })
  
  await server.start()

  const app = express()
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({req, res}) => {
        const auth = req ? req.headers.authorization : null
        try {
          if (auth && auth.startsWith('Bearer ')) {
            const decodedData = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
            const currentUser = await User.findById(decodedData._id)
            return { currentUser }
          }
        } catch {
          null
        }
      }
    }))
    app.listen(PORT)

}

start()
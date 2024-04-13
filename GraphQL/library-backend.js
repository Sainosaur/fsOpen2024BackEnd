const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('@apollo/server')
const User = require('./src/Models/User')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const typeDefs = require('./src/typedefs')
const resolvers = require('./src/resolvers')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@apollo/server/express4')
const { useServer } = require('graphql-ws/lib/use/ws')
const { WebSocketServer } = require('ws')
const http = require('http')
const PORT = 4000


const start = async () => {
  const app = express()
  // Starts a HTTP server using the express application
  const httpServer = http.createServer(app)
    // Starts new websocket server for subcriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/'
  })
  const schema = makeExecutableSchema({typeDefs, resolvers})
  const serverCleanup = useServer({ schema }, wsServer)


  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            }
          }
        }
      }
    ]
  })

  
  await server.start()

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

  httpServer.listen(PORT, () => console.log('Server running'))

}

start()
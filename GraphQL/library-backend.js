const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')
const Book = require('./Models/Book')
const Author = require('./Models/Author')
const User = require('./Models/User')
const mongoose = require('mongoose')
require('dotenv').config()
const mongoUrl = `mongodb+srv://saiadi4002:${process.env.MONGO_URI}@library.i84fg9g.mongodb.net/`
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

let authors = []
let books = []

const typeDefs = `
  type User {
    username: String!
    favouriteGenre: String!
    passwordHash: String!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    id: ID!
    genres: [String]!
  }

  type Author {
    name: String!
    id: ID
    born: Int
    bookCount: Int
  }

  type Query {
    me: User
    allBooks(author: String, genre:String): [Book]
    allAuthors: [Author]
    bookCount : Int!
    authorCount: Int!
  }
  
  type Mutation {
    createUser(username: String!, favouriteGenre: String!, password: String! ): User
    login(username: String!, password: String! ): Token
    addBook(title: String!, author: String!, published: Int!, genres:[String]!): Book
    editAuthor(name: String, setBornYear: Int) : Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let localBooks = [...books]
      args.author ? localBooks = localBooks.filter(book => book.author.name === args.author) : null
      args.genre ? localBooks = localBooks.filter(book => book.genres.includes(args.genre)) : null
      return localBooks
    },
    allAuthors: () => {
      return authors
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  }, Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("No Active User, Editing books requires a logged in user", {
          extensions:{
            code: 'FORBIDDEN'
          }
        })
      }
      let newAuthor;
      if (!authors.find(auth => auth.name === args.author)) {
        try {
          newAuthor = new Author({
            name: args.author,
            born: null,
          })
          await newAuthor.save()
          authors = authors.concat(newAuthor)
        } catch {
          throw new GraphQLError('Author name too short', {
            extensions: {
              code:'BAD_USER_INPUT',
              invalidArgs: args.author
            }
          })
        }

      } else {
        newAuthor = authors.find((auth) => auth.name === args.author)
      }
      const newBook = new Book({
        ...args,
        author: newAuthor
      })
      try {
        await newBook.save()
        books = books.concat(newBook)  
      } catch {
        throw new GraphQLError('Book name too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title
          }
        })
      }
      return newBook
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("No Active User, Editing books requires a logged in user", {
          extensions:{
            code: 'FORBIDDEN'
          }
        })
      }
      try {
        let author = authors.find(author => author.name === args.name)
        if (author) {
          author.born = args.setBornYear
          await Author.findByIdAndUpdate(author._id, author)
          authors = authors.map(a => a.name == author.name ? author : a)
        }
      } catch {
        throw GraphQLError('Author name too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.author
          }
        })
      }

      return author
    },
    login: async (root, args) => {
        const usr = await User.findOne({username: args.username})
        if (!usr) {
          throw new GraphQLError('Incorrect Username', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username
            }
          })
        }
        const pwdMatch = await bcrypt.compare(args.password, usr.passwordHash)
        if (pwdMatch) {
          const Token = jwt.sign(usr.toJSON(), process.env.JWT_SECRET)
          return {
            value: Token
          }
        } else {
          throw new GraphQLError('Incorrect Password', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.password
            }
          })
        }
    },
    createUser: async (root, args) => {
      const newUsr = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
        passwordHash: await bcrypt.hash(args.password, 10)
      })
      await newUsr.save()
      return newUsr
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({req, res}) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedData = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedData._id)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  // Gets the data from MongoDB as soon as server starts up sucessfully. 
  mongoose.connect(mongoUrl)
  .then(() => console.log('MongoDB connection established'))
  .catch( (err) => console.log('failed to connect to MongoDB', err))

  Author.find({})
  .then((data) => {
    authors = data
  })
  Book.find({})
  .populate('author')
  .then((data) => {
    books = data.filter(data => data.author)
  })
  .then(() => console.log(`Server ready at ${url}`))
})

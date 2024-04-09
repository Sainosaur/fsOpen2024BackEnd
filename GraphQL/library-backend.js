const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')
const Book = require('./Models/Book')
const Author = require('./Models/Author')
const mongoose = require('mongoose')
require('dotenv').config()
const mongoUrl = `mongodb+srv://saiadi4002:${process.env.MONGO_URI}@library.i84fg9g.mongodb.net/`

let authors = []
let books = []


const typeDefs = `
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
    allBooks(author: String, genre:String): [Book]
    allAuthors: [Author]
    bookCount : Int!
    authorCount: Int!
  }
  
  type Mutation {
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
    }
  }, Mutation: {
    addBook: async (root, args) => {
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
    editAuthor: async (root, args) => {
      try {
        let author = authors.find(author => author.name === args.name)
        if (author) {
          author.born = args.setBornYear
          await Author.findByIdAndUpdate(author._id, author)
          authors = authors.map(a => a.name == author.name ? author : a)
        }
      } catch {
        throw GraphQLError('Au')
      }

      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
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

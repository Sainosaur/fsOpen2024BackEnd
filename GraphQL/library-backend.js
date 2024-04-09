const { ApolloServer } = require('@apollo/server')
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
    addBook: (root, args) => {
      let newAuthor;
      if (!authors.find(auth => auth.name === args.author)) {
        newAuthor = new Author({
          name: args.author,
          born: null,
        })
        newAuthor.save().then(() => authors = authors.concat(newAuthor))
      } else {
        newAuthor = authors.find((auth) => auth.name === args.author)
      }
      const newBook = new Book({
        ...args,
        author: newAuthor
      })
      
      newBook.save().then(() => books = books.concat(newBook))

      return newBook
    },
    editAuthor: async (root, args) => {
      let author = authors.find(author => author.name === args.name)
      if (author) {
        author.born = args.setBornYear
        await Author.findByIdAndUpdate(author._id, author)
        authors = authors.map(a => a.name == author.name ? author : a)
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
